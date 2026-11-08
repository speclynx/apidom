import { propEq } from 'ramda';
import {
  isElement,
  Element,
  RefElement,
  ParseResultElement,
  ObjectElement,
  ArrayElement,
  MemberElement,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
  cloneDeep,
  cloneShallow,
  isObjectElement,
} from '@speclynx/apidom-datamodel';
import { toYAML, toGeneric } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, traverseAsync, type Path } from '@speclynx/apidom-traverse';
import { URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';

import UnresolvableReferenceError from '../../errors/UnresolvableReferenceError.ts';
import MaximumDereferenceDepthError from '../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../errors/MaximumResolveDepthError.ts';
import * as url from '../../util/url.ts';
import parse from '../../parse/index.ts';
import Reference from '../../Reference.ts';
import ReferenceSet from '../../ReferenceSet.ts';
import type { ReferenceOptions } from '../../options/index.ts';

const genericClasses = new Set<unknown>([
  ObjectElement,
  ArrayElement,
  MemberElement,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
]);

/**
 * Whether the element is generic ApiDOM: an instance of a primitive element class itself.
 * Semantic elements may carry a primitive element name (e.g. a map of components named
 * `object`), so the name alone doesn't tell.
 * @internal
 */
export const isGenericElement = (element: Element): boolean =>
  genericClasses.has(element.constructor);

/**
 * A source dereferenced as one type: the source as that semantic type, with every reference
 * within it transcluded. `element` exists from the start, so references leading back to
 * an element still being dereferenced (cycles) can be transcluded with it.
 * @internal
 */
export interface DereferencedElement {
  element: Element;
  done: boolean;
  // longest chain of references followed within the element, for dereference.maxDepth
  height: number;
  // the source is itself a referencing element (an alias of its target)
  alias: boolean;
  // an alias whose reference never reaches a value: it's kept as written
  unresolved: boolean;
}

/**
 * How a referencing element is transcluded with the dereferenced target of its reference.
 * @internal
 */
export interface TransclusionSpec {
  /**
   * The element transcluded in place of the referencing element, built from the dereferenced
   * target (which may still be being dereferenced when the reference leads back to it).
   */
  readonly toTranscludedElement: (referencingElement: Element, target: Element) => Element;
  /**
   * Field holding the reference of an alias, for references merging their target with
   * the fields next to them (e.g. `$ref`): a target that is an alias whose reference never
   * reaches a value is merged without that field, so only the fields along the chain remain.
   * Without it, a referencing element leading to such an alias is kept as written.
   */
  readonly aliasField?: string;
  /**
   * What a circular reference is reported and replaced with: the RefElement content and meta
   * for `dereference.circular: 'replace'`, the error details for `'error'`.
   */
  readonly circular: {
    readonly uri: string;
    readonly meta: Record<string, unknown>;
    readonly details: Record<string, unknown>;
  };
}

/**
 * A transclusion to perform.
 * @internal
 */
export interface Transclusion extends TransclusionSpec {
  readonly target: DereferencedElement;
  // the reference leads back to an element still being dereferenced
  readonly back: boolean;
  // the referencing element is kept as it is
  readonly keep: boolean;
  // the target is attached without being dereferenced: it follows no references
  readonly attachment: boolean;
}

/**
 * The target of a reference: the source element, the type the reference expects, and the
 * document the source belongs to. `context` is passed to the visitor dereferencing the source.
 * @internal
 */
export interface DereferenceTarget<TContext = unknown> {
  readonly source: Element;
  readonly type: string;
  readonly reference: Reference;
  readonly context: TContext;
}

/**
 * State shared by all the visitors of a single dereference run.
 * @internal
 */
export interface DereferenceRun {
  readonly dereferenced: WeakMap<Element, Map<string, DereferencedElement>>;
  readonly refracted: WeakMap<Element, Map<string, Element>>;
  // dereferencing in place: a source is its own dereferenced element
  readonly inPlace: boolean;
  // source element to its copy: a structure is copied once and shared by every
  // dereferenced element containing it, so the result keeps its identities
  readonly copies: WeakMap<object, object>;
  // elements transcluded in place of referencing elements: never traversed again
  readonly transcluded: WeakSet<Element>;
  // referencing elements whose failure has been reported: they're kept as written
  readonly failed: WeakSet<Element>;
  // failures reported, by document, location and reference: a source read as several types
  // holds a referencing element per type
  readonly reported: Set<string>;
  // undoes the memoization of what's dereferenced or refracted, newest last
  readonly undo: (() => void)[];
}

/**
 * @internal
 */
export interface DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * Dereferences a document by the type each reference expects of its target. With the immutable
 * option the documents aren't edited and the result is a new tree; otherwise they're
 * dereferenced in place.
 *
 * Every referenced structure is dereferenced once per type the references reaching it expect.
 * A source is dereferenced as a type in two steps. First it's traversed, and for each reference
 * within it the target is located, dereferenced as the expected type, and recorded as
 * a transclusion. Then the referencing elements are transcluded with the dereferenced targets.
 * A dereferenced element is shared by all the references leading to it; a reference leading
 * to an element still being dereferenced is a cycle.
 *
 * Strategies provide the handlers locating the targets of their references, the refraction to
 * their semantic types and the visitors dereferencing the targets.
 * @internal
 */
abstract class DereferenceVisitor<TContext = unknown> {
  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  /**
   * Base URI of the current document for resolving relative references.
   */
  protected readonly baseURI: string;

  protected run: DereferenceRun;

  /**
   * Map from the elements of the source the visitor traverses to their copies.
   */
  protected cloneMap?: WeakMap<object, object>;

  /**
   * Source the visitor traverses a refraction of, when it's dereferenced as another type.
   */
  protected refractedFrom?: Element;

  /**
   * Transclusions to perform, keyed by the (copy of the) referencing element.
   */
  protected readonly transclusions = new Map<Element, Transclusion>();

  /**
   * Number of references followed to reach the source the visitor traverses.
   */
  protected depth = 0;

  /**
   * The source the visitor traverses, dereferenced.
   */
  protected current?: DereferencedElement;

  constructor({ reference, options }: DereferenceVisitorOptions) {
    this.reference = reference;
    this.options = options;
    this.baseURI = this.toDocumentBaseURI(reference);
    this.run = {
      dereferenced: new WeakMap(),
      refracted: new WeakMap(),
      inPlace: !options.dereference.immutable,
      copies: new WeakMap(),
      transcluded: new WeakSet(),
      failed: new WeakSet(),
      reported: new Set(),
      undo: [],
    };
  }

  /**
   * Name of the strategy, for strategy specific options.
   */
  protected abstract get strategyName(): string;

  /**
   * Creates the visitor dereferencing a source of the given document.
   */
  protected abstract createVisitor(reference: Reference, context: TContext): DereferenceVisitor;

  /**
   * Refracts a generic element to the given type.
   */
  protected abstract refractTo(element: Element, type: string): Element;

  /**
   * Whether the element is of the given type, so it needs no refraction.
   */
  protected isOfType(element: Element, type: string): boolean {
    return element.element === type;
  }

  /**
   * Base URI of a document: its retrieval URI unless the document identifies itself otherwise.
   */
  protected toDocumentBaseURI(reference: Reference): string {
    return reference.uri;
  }

  /**
   * A document already loaded in the run identified by the URI other than by its retrieval URI.
   */
  protected findReferenceByIdentity(_uri: string): Reference | undefined {
    return undefined;
  }

  /**
   * Dereferences the element, which belongs to the document of the visitor's reference.
   * With the immutable option the element isn't edited and its dereferenced copy is returned;
   * otherwise it's dereferenced in place and returned.
   */
  public async dereference<T extends Element>(element: T, context: TContext): Promise<T> {
    const dereferenced = await this.dereferenceAs(
      { source: element, type: element.element, reference: this.reference, context },
      0,
    );
    return dereferenced.element as T;
  }

  protected toBaseURI(uri: string): string {
    return url.resolve(this.baseURI, url.sanitize(url.stripHash(uri)));
  }

  protected async toReference(uri: string): Promise<Reference> {
    // detect maximum depth of resolution
    if (this.reference.depth >= this.options.resolve.maxDepth) {
      throw new MaximumResolveDepthError(
        `Maximum resolution depth of ${this.options.resolve.maxDepth} has been exceeded by file "${this.reference.uri}"`,
        { maxDepth: this.options.resolve.maxDepth, uri: this.reference.uri },
      );
    }

    const baseURI = this.toBaseURI(uri);
    const { refSet } = this.reference as { refSet: ReferenceSet };

    // we've already processed this Reference in past
    if (refSet.has(baseURI)) {
      return refSet.find(propEq(baseURI, 'uri'))!;
    }

    const referenceByIdentity = this.findReferenceByIdentity(baseURI);
    if (referenceByIdentity !== undefined) {
      return referenceByIdentity;
    }

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    // registered as parsed: with the immutable option it's only ever copied, never edited
    const reference = new Reference({
      uri: baseURI,
      value: parseResult,
      depth: this.reference.depth + 1,
    });
    refSet.add(reference);

    return reference;
  }

  /**
   * Handles an error according to the continueOnError option.
   *
   * For new errors: wraps in UnresolvableReferenceError with structured context
   * (type, uri, location, codeFrame, refFieldName, refFieldValue, trace).
   * For errors already wrapped by a nested visitor: prepends the current hop to the trace.
   *
   * Inner/intermediate visitors always throw to let the trace accumulate.
   * Only the entry document visitor respects continueOnError (callback/swallow/throw),
   * and reports the failure of a referencing element once.
   */
  protected handleError(
    message: string,
    error: Error,
    referencingElement: Element,
    refFieldName: string,
    refFieldValue: string,
    visitorPath: Path<Element>,
  ): void {
    const { continueOnError } = this.options.dereference;
    const isEntryDocument =
      url.stripHash(this.reference.refSet?.rootRef?.uri ?? '') === this.reference.uri;
    const uri = this.reference.uri;
    const type = referencingElement.element as string;
    const codeFrame = toYAML(referencingElement);

    // find element location by identity in the document tree.
    // guarded: this.reference.value may not be a ParseResultElement or may lack a result.
    // falls back to visitorPath, which is relative to the source being traversed
    let location: string | undefined;
    let refractedFromLocation: string | undefined;
    const root = (this.reference.value as ParseResultElement).result;
    if (isElement(root)) {
      traverse(root, {
        enter: (p: Path<Element>) => {
          if (p.node === referencingElement) {
            location = p.formatPath();
            p.stop();
          } else if (p.node === this.refractedFrom) {
            refractedFromLocation = p.formatPath();
          } else if (this.isTranscluded(p.node)) {
            p.skip();
          }
        },
      });
    }
    // within a refraction, the visitor path is relative to the refracted source
    location ??= (refractedFromLocation ?? '') + visitorPath.formatPath();

    const hop = { uri, type, refFieldName, refFieldValue, location, codeFrame };

    // enrich existing error from nested visitor or create new one
    let unresolvedError: UnresolvableReferenceError;
    if (error instanceof UnresolvableReferenceError) {
      // prefix relative locations for entries belonging to the referenced document
      const refBaseURI = this.toBaseURI(refFieldValue);
      const fragment = URIFragmentIdentifier.fromURIReference(refFieldValue);
      if (fragment) {
        if (refBaseURI === (error as any).uri && (error as any).location) {
          (error as any).location = fragment + (error as any).location;
        }
        for (const h of (error as any).trace) {
          if (h.uri === refBaseURI && h.location) h.location = fragment + h.location;
        }
      }
      // @ts-ignore
      error.trace = [hop, ...error.trace];
      unresolvedError = error;
    } else {
      unresolvedError = new UnresolvableReferenceError(message, {
        cause: error,
        type,
        uri,
        location,
        codeFrame,
        refFieldName,
        refFieldValue,
        trace: [],
      });
    }

    if (!isEntryDocument || continueOnError === false) throw unresolvedError;
    // a referencing element is traversed again by every source containing it: its failure is reported once
    this.run.failed.add(referencingElement);
    const failure = JSON.stringify([uri, location, refFieldName, refFieldValue]);
    if (this.run.reported.has(failure)) return;
    this.run.reported.add(failure);
    if (typeof continueOnError === 'function') continueOnError(unresolvedError);
  }

  /**
   * The source as the given semantic type: the source itself when it's of that type, otherwise
   * its refraction to that type, made once per dereference run. The refraction is made from
   * the source dereferenced as its own type, so it doesn't depend on which reference
   * reaches the source first.
   */
  protected async toSemantic(target: DereferenceTarget<TContext>, depth: number): Promise<Element> {
    const { source, type } = target;
    if (this.isOfType(source, type)) return source;

    let byType = this.run.refracted.get(source);
    if (byType === undefined) {
      byType = new Map();
      this.run.refracted.set(source, byType);
    }
    const cached = byType.get(type);
    if (cached !== undefined) return cached;

    const dereferenced = isGenericElement(source)
      ? source
      : (await this.dereferenceAs({ ...target, type: source.element }, depth)).element;
    // dereferencing the source may have led back to this very refraction
    const reached = byType.get(type);
    if (reached !== undefined) return reached;

    const semantic = this.refractTo(toGeneric(dereferenced), type);
    byType.set(type, semantic);
    this.run.undo.push(() => byType.delete(type));
    return semantic;
  }

  /**
   * Dereferences the source as the given type, once per dereference run. `depth` is the number
   * of references followed to reach the source.
   */
  protected async dereferenceAs(
    target: DereferenceTarget<TContext>,
    depth: number,
  ): Promise<DereferencedElement> {
    const { source, type, reference, context } = target;
    let byType = this.run.dereferenced.get(source);
    if (byType === undefined) {
      byType = new Map();
      this.run.dereferenced.set(source, byType);
    }
    const existing = byType.get(type);
    if (existing !== undefined) return existing;

    const semantic = await this.toSemantic(target, depth);
    // a refraction is made for the run, so it's dereferenced as is
    const isOwned = semantic !== source || this.run.inPlace;
    const cloneMap = isOwned ? undefined : this.run.copies;
    const dereferenced: DereferencedElement = {
      element: isOwned ? semantic : cloneDeep(semantic, { visited: cloneMap }),
      done: false,
      height: 0,
      alias: false,
      unresolved: false,
    };
    // a failure discards whatever got dereferenced or refracted meanwhile, as it may lead to this element
    const undoSize = this.run.undo.length;
    byType.set(type, dereferenced);
    this.run.undo.push(() => byType.delete(type));

    const visitor = this.createVisitor(reference, context);
    visitor.run = this.run;
    visitor.cloneMap = cloneMap;
    visitor.refractedFrom = semantic !== source ? source : undefined;
    visitor.depth = depth;
    visitor.current = dereferenced;

    try {
      // the handlers only record transclusions
      await traverseAsync(semantic, visitor);
    } catch (error) {
      this.run.undo
        .splice(undoSize)
        .reverse()
        .forEach((undo) => undo());
      throw error;
    }

    for (const transclusion of visitor.transclusions.values()) {
      if (!transclusion.back && !transclusion.attachment) {
        dereferenced.height = Math.max(dereferenced.height, transclusion.target.height + 1);
      }
    }
    const rootTransclusion = visitor.transclusions.get(dereferenced.element);
    dereferenced.unresolved =
      rootTransclusion !== undefined &&
      (rootTransclusion.keep || rootTransclusion.target.unresolved);
    dereferenced.element = visitor.transclude(dereferenced.element);
    dereferenced.done = true;

    return dereferenced;
  }

  /**
   * Dereferences the target of a reference as the expected type and records the transclusion.
   */
  protected async addTransclusion(
    path: Path<Element>,
    target: DereferenceTarget<TContext>,
    spec: TransclusionSpec,
  ): Promise<void> {
    const referencingCopy = (this.cloneMap?.get(path.node) ?? path.node) as Element;
    const { maxDepth } = this.options.dereference;

    // the source being traversed is itself a referencing element: an alias of the target
    if (path.parentPath === null && this.current !== undefined) this.current.alias = true;

    // detect maximum depth of dereferencing
    if (this.depth + 1 > maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${maxDepth}" has been exceeded in file "${this.reference.uri}"`,
        { maxDepth, uri: this.reference.uri },
      );
    }

    const existing = this.run.dereferenced.get(target.source)?.get(target.type);

    // a target dereferenced earlier counts the references followed within it as well
    if (existing?.done && this.depth + 1 + existing.height > maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${maxDepth}" has been exceeded in file "${this.reference.uri}"`,
        { maxDepth, uri: this.reference.uri },
      );
    }

    // a reference leading to an element still being dereferenced is a cycle
    if (existing !== undefined && !existing.done) {
      this.reference.refSet!.circular = true;

      if (this.options.dereference.circular === 'error') {
        throw new ApiDOMStructuredError('Circular reference detected', spec.circular.details);
      }
      // an alias has no value before its own reference is transcluded: the referencing element
      // is kept, to be transcluded by an enclosing dereferenced element, if any
      const keep = existing.alias && this.options.dereference.circular === 'ignore';
      this.transclusions.set(referencingCopy, {
        ...spec,
        target: existing,
        back: true,
        keep,
        attachment: false,
      });
      return;
    }

    const dereferenced = existing ?? (await this.dereferenceAs(target, this.depth + 1));
    // the referencing element failed while its target was dereferenced, e.g. as a circular reference
    if (this.run.failed.has(path.node)) return;
    this.transclusions.set(referencingCopy, {
      ...spec,
      target: dereferenced,
      back: false,
      keep: false,
      attachment: false,
    });
  }

  /**
   * Records the transclusion of a referencing element with a target that isn't dereferenced:
   * the target as the expected type is attached as it is, e.g. an Operation Object to the Link
   * Object pointing at it. Attached targets never form cycles.
   */
  protected async addAttachment(
    path: Path<Element>,
    target: DereferenceTarget<TContext>,
    toTranscludedElement: TransclusionSpec['toTranscludedElement'],
  ): Promise<void> {
    const referencingCopy = (this.cloneMap?.get(path.node) ?? path.node) as Element;
    const semantic = await this.toSemantic(target, this.depth + 1);
    // with the immutable option, the attached target is its copy in the result when it has one
    const element = this.run.inPlace
      ? semantic
      : ((this.run.copies.get(semantic) as Element | undefined) ?? semantic);

    this.transclusions.set(referencingCopy, {
      toTranscludedElement,
      circular: { uri: '', meta: {}, details: {} },
      target: { element, done: true, height: 0, alias: false, unresolved: false },
      back: false,
      keep: false,
      attachment: true,
    });
  }

  /**
   * Transcludes every referencing element within the element with its dereferenced target.
   */
  protected transclude(element: Element): Element {
    if (this.transclusions.size === 0) return element;

    // replaced on leave: nested referencing elements first, so merges see them replaced
    traverse(
      element,
      {
        enter: (path: Path<Element>) => {
          if (this.isTranscluded(path.node)) path.skip();
        },
        leave: (path: Path<Element>) => {
          const transclusion = this.transclusions.get(path.node);
          if (path.node !== element && transclusion !== undefined) {
            const transcludedElement = this.toTranscludedElement(path.node, transclusion);
            // a kept referencing element is left to be transcluded by an enclosing element
            if (transcludedElement === path.node) return;
            this.run.transcluded.add(transcludedElement);
            path.replaceWith(transcludedElement);
          }
        },
      },
      { mutable: true },
    );

    const rootTransclusion = this.transclusions.get(element);
    if (rootTransclusion === undefined) return element;

    // references leading back to the element may already be transcluded with it, so it's filled in place
    const transcludedElement = this.toTranscludedElement(element, rootTransclusion);
    if (transcludedElement === element) return element;
    if (transcludedElement.constructor !== element.constructor) return transcludedElement;
    element.element = transcludedElement.element;
    element.content = transcludedElement.content;
    element.meta = transcludedElement.meta;
    element.attributes = transcludedElement.attributes;
    return element;
  }

  /**
   * The element transcluded in place of a referencing element.
   */
  protected toTranscludedElement(referencingElement: Element, transclusion: Transclusion): Element {
    // the referencing element waits for an enclosing element to transclude it
    if (transclusion.keep) return referencingElement;
    // an alias whose reference never reaches a value
    if (transclusion.target.unresolved) {
      const { aliasField } = transclusion;
      const alias = transclusion.target.element;
      if (aliasField === undefined || !isObjectElement(alias)) return referencingElement;
      const fields = cloneShallow(alias);
      fields.remove(aliasField);
      return transclusion.toTranscludedElement(referencingElement, fields);
    }

    if (transclusion.back && this.options.dereference.circular === 'replace') {
      const refElement = new RefElement(transclusion.circular.uri, {
        type: referencingElement.element,
        ...transclusion.circular.meta,
      });
      const replacer =
        this.options.dereference.strategyOpts[this.strategyName]?.circularReplacer ??
        this.options.dereference.circularReplacer;
      return replacer(refElement);
    }

    return transclusion.toTranscludedElement(referencingElement, transclusion.target.element);
  }

  /**
   * Whether the element is transcluded in place of a referencing element, in this run or,
   * when dereferencing in place, in an earlier one: transcluded elements carry the `ref-type` meta,
   * which only dereferencing sets (bundling annotates hoisted elements with `ref-origin` only).
   */
  protected isTranscluded(element: Element): boolean {
    return (
      this.run.transcluded.has(element) || (!element.isMetaEmpty && element.meta.hasKey('ref-type'))
    );
  }

  /**
   * Dereferenced in place, a source may already hold transcluded elements.
   */
  public enter(path: Path<Element>) {
    if (this.isTranscluded(path.node)) path.skip();
  }
}

export default DereferenceVisitor;
