import { propEq, none } from 'ramda';
import {
  isElement,
  isStringElement,
  isParseResultElement,
  isPrimitiveElement,
  includesClasses,
  Element,
  RefElement,
  BooleanElement,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue, toYAML, toGeneric } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, traverseAsync, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate as jsonPointerEvaluate,
  compile as jsonPointerCompile,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  ArazzoSpecification1Element,
  ReusableElement,
  JSONSchemaElement,
  isParameterElement,
  isJSONSchemaElement,
  isBooleanJSONSchemaElement,
  refract,
  refractJSONSchema,
} from '@speclynx/apidom-ns-arazzo-1';
import { parse as parseRuntimeExpression } from '@swaggerexpert/arazzo-runtime-expression';

import { isAnchor, uriToAnchor, locate as $anchorLocate } from './selectors/$anchor.ts';
import { locate as uriLocate, type Schema$idIndex } from './selectors/uri.ts';
import { locate as jsonPointerLocate } from '../openapi-3-1/selectors/json-pointer.ts';
import {
  isJSONSchemaElementWith$id,
  collectSchema$ids,
  resolveSchema$ids,
  resolveSchemaBaseURI,
  resolveSchema$refField,
} from '../openapi-3-1/util.ts';
import {
  maybeRefractToJSONSchemaElement,
  resolveArazzo$selfField,
  identifiedBy$self,
} from './util.ts';
import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import MaximumDereferenceDepthError from '../../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import File from '../../../File.ts';
import Resolver from '../../../resolve/resolvers/Resolver.ts';
import EvaluationJsonSchemaUriError from '../../../errors/EvaluationJsonSchemaUriError.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Type a JSON Schema `$ref` expects its target to have.
 */
const JSON_SCHEMA_TYPE = 'JSONSchema';

/**
 * A source dereferenced as one type: the source as that semantic type, with every reference
 * within it transcluded. `element` exists from the start, so references leading back to
 * an element still being dereferenced (cycles) can be transcluded with it.
 */
interface DereferencedElement {
  element: Element;
  done: boolean;
}

/**
 * A transclusion to perform: the dereferenced element a referencing element is transcluded
 * with, and whether the reference leads back to an element still being dereferenced.
 */
interface Transclusion {
  readonly kind: 'reusable' | 'schema';
  readonly target: DereferencedElement;
  readonly back: boolean;
  readonly refValue: string;
  readonly refURI: string;
  readonly origin: string;
}

/**
 * State shared by all the visitors of a single dereference run.
 */
interface DereferenceRun {
  readonly dereferenced: WeakMap<Element, Map<string, DereferencedElement>>;
  readonly refracted: WeakMap<Element, Map<string, Element>>;
  // dereferencing in place: a source is its own dereferenced element
  readonly inPlace: boolean;
  // source element to its copy: a structure is copied once and shared by every
  // dereferenced element containing it, so the result keeps its identities
  readonly copies: WeakMap<object, object>;
  // elements transcluded in place of referencing elements: never traversed again
  readonly transcluded: WeakSet<Element>;
  // referencing elements whose failure has been reported
  readonly failed: WeakSet<Element>;
}

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly schema$idIndex?: Schema$idIndex;
  readonly ancestorSchema$ids?: string[];
}

/**
 * Dereferences an Arazzo document without editing it.
 *
 * Every referenced structure is dereferenced once per type the references reaching it
 * expect: Reusable Objects expect the type of their `referenced-element` meta, JSON Schema
 * `$ref`s expect a JSON Schema. A source is dereferenced as a type in two steps. First it's
 * traversed, and for each reference within it the target is located, dereferenced as
 * the expected type, and recorded as a transclusion. Then the referencing elements are
 * transcluded with the dereferenced targets, annotated by the referencing elements.
 * A dereferenced element is shared by all the references leading to it; a reference leading
 * to an element still being dereferenced is a cycle.
 *
 * @public
 */
class Arazzo1DereferenceVisitor {
  protected readonly reference: Reference;

  /**
   * Base URI of the current document for resolving relative references.
   * Honors the Arazzo `$self` field when present, otherwise falls back
   * to the retrieval URI (`this.reference.uri`).
   */
  protected readonly baseURI: string;

  protected readonly options: ReferenceOptions;

  /**
   * Index of `$id`-bearing schemas per document, shared across the visitors
   * of a single dereference run.
   */
  protected readonly schema$idIndex: Schema$idIndex;

  /**
   * `$id`s of the JSON Schema elements enclosing the traversal root within its
   * document (outermost first). Empty when the root is the document itself; a
   * visitor traversing a fragment is seeded with the `$id`s of the schemas the
   * fragment sits under, so the `$ref`s and `$id`s within resolve against the
   * same base as they would from the document root.
   */
  protected readonly ancestorSchema$ids: string[];

  protected run: DereferenceRun;

  /**
   * Map from the elements of the source the visitor traverses to their copies.
   */
  protected cloneMap?: WeakMap<object, object>;

  /**
   * Transclusions to perform, keyed by the (copy of the) referencing element.
   */
  protected readonly transclusions = new Map<Element, Transclusion>();

  /**
   * Number of references followed to reach the source the visitor traverses.
   */
  protected depth = 0;

  constructor({
    reference,
    options,
    schema$idIndex = new WeakMap(),
    ancestorSchema$ids = [],
  }: Arazzo1DereferenceVisitorOptions) {
    this.reference = reference;
    this.baseURI = resolveArazzo$selfField(
      reference.uri,
      (reference.value as ParseResultElement | undefined)?.result,
    );
    this.options = options;
    this.schema$idIndex = schema$idIndex;
    this.ancestorSchema$ids = ancestorSchema$ids;
    this.run = {
      dereferenced: new WeakMap(),
      refracted: new WeakMap(),
      inPlace: !options.dereference.immutable,
      copies: new WeakMap(),
      transcluded: new WeakSet(),
      failed: new WeakSet(),
    };
  }

  /**
   * Dereferences the element, which belongs to the document of the visitor's reference.
   * The element itself is never edited; the dereferenced copy is returned.
   */
  public async dereference<T extends Element>(element: T): Promise<T> {
    const dereferenced = await this.dereferenceAs(
      element,
      element.element,
      this.reference,
      this.ancestorSchema$ids,
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

    // identity-based referencing: URI matches `$self` of an already processed Arazzo document
    const referenceBy$self = refSet.find(identifiedBy$self(baseURI));
    if (referenceBy$self !== undefined) {
      return referenceBy$self;
    }

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    // documents are never edited while dereferencing, so the parse result is registered as is
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
   * Only the entry document visitor respects continueOnError (callback/swallow/throw).
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
    // when the referencing element belongs to a source refracted to another type.
    let location: string | undefined;
    const root = (this.reference.value as ParseResultElement).result;
    if (isElement(root)) {
      traverse(root, {
        enter: (p: Path<Element>) => {
          if (p.node === referencingElement) {
            location = p.formatPath();
            p.stop();
          } else if (this.isTranscluded(p.node)) {
            p.skip();
          }
        },
      });
    }
    location ??= visitorPath.formatPath();

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
    if (typeof continueOnError === 'function') continueOnError(unresolvedError);
  }

  /**
   * The source as the given semantic type: the source itself when it's of that type, otherwise
   * its refraction to that type, made once per dereference run. The refraction is made from
   * the source dereferenced as its own type, so it doesn't depend on which reference
   * reaches the source first.
   */
  protected async toSemantic(
    source: Element,
    type: string,
    reference: Reference,
    ancestorSchema$ids: string[],
    depth: number,
  ): Promise<Element> {
    const isOfType =
      type === JSON_SCHEMA_TYPE
        ? isJSONSchemaElement(source) || isBooleanJSONSchemaElement(source)
        : source.element === type;
    if (isOfType) return source;

    let byType = this.run.refracted.get(source);
    if (byType === undefined) {
      byType = new Map();
      this.run.refracted.set(source, byType);
    }
    const cached = byType.get(type);
    if (cached !== undefined) return cached;

    const dereferenced = isPrimitiveElement(source)
      ? source
      : (await this.dereferenceAs(source, source.element, reference, ancestorSchema$ids, depth))
          .element;
    // dereferencing the source may have led back to this very refraction
    const reached = byType.get(type);
    if (reached !== undefined) return reached;

    const generic = toGeneric(dereferenced);
    const semantic =
      type === JSON_SCHEMA_TYPE ? refractJSONSchema(generic) : refract(generic, { element: type });
    byType.set(type, semantic);
    return semantic;
  }

  /**
   * Dereferences the source as the given type, once per dereference run.
   */
  protected async dereferenceAs(
    source: Element,
    type: string,
    reference: Reference,
    ancestorSchema$ids: string[],
    depth: number,
  ): Promise<DereferencedElement> {
    let byType = this.run.dereferenced.get(source);
    if (byType === undefined) {
      byType = new Map();
      this.run.dereferenced.set(source, byType);
    }
    const existing = byType.get(type);
    if (existing !== undefined) return existing;

    const semantic = await this.toSemantic(source, type, reference, ancestorSchema$ids, depth);
    // a refraction is made for the run, so it's dereferenced as is
    const isOwned = semantic !== source || this.run.inPlace;
    const cloneMap = isOwned ? undefined : this.run.copies;
    const dereferenced: DereferencedElement = {
      element: isOwned ? semantic : cloneDeep(semantic, { visited: cloneMap }),
      done: false,
    };
    byType.set(type, dereferenced);

    const visitor = new Arazzo1DereferenceVisitor({
      reference,
      options: this.options,
      schema$idIndex: this.schema$idIndex,
      ancestorSchema$ids,
    });
    visitor.run = this.run;
    visitor.cloneMap = cloneMap;
    visitor.depth = depth;

    try {
      // the handlers only record transclusions
      await traverseAsync(semantic, visitor);
    } catch (error) {
      byType.delete(type);
      throw error;
    }

    dereferenced.element = visitor.transclude(dereferenced.element);
    dereferenced.done = true;

    return dereferenced;
  }

  /**
   * Dereferences the target of a reference as the expected type and records the transclusion.
   */
  protected async addTransclusion(
    path: Path<Element>,
    targetSource: Element,
    type: string,
    targetReference: Reference,
    targetAncestorSchema$ids: string[],
    transclusion: Omit<Transclusion, 'target' | 'back'>,
  ): Promise<void> {
    const referencingCopy = (this.cloneMap?.get(path.node) ?? path.node) as Element;

    // detect maximum depth of dereferencing
    if (this.depth + 1 > this.options.dereference.maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
        { maxDepth: this.options.dereference.maxDepth, uri: this.reference.uri },
      );
    }

    const existing = this.run.dereferenced.get(targetSource)?.get(type);

    // a reference leading to an element still being dereferenced is a cycle
    if (existing !== undefined && !existing.done) {
      this.reference.refSet!.circular = true;

      if (this.options.dereference.circular === 'error') {
        throw new ApiDOMStructuredError('Circular reference detected', {
          [transclusion.kind === 'reusable' ? 'runtimeExpression' : '$ref']: transclusion.refValue,
        });
      }
      this.transclusions.set(referencingCopy, { ...transclusion, target: existing, back: true });
      return;
    }

    const target =
      existing ??
      (await this.dereferenceAs(
        targetSource,
        type,
        targetReference,
        targetAncestorSchema$ids,
        this.depth + 1,
      ));
    this.transclusions.set(referencingCopy, { ...transclusion, target, back: false });
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
    if (transcludedElement.constructor !== element.constructor) return transcludedElement;
    element.element = transcludedElement.element;
    element.content = transcludedElement.content;
    element.meta = transcludedElement.meta;
    element.attributes = transcludedElement.attributes;
    return element;
  }

  /**
   * The element transcluded in place of a referencing element: its dereferenced target,
   * annotated by the referencing element and overridden by its fields.
   */
  protected toTranscludedElement(referencingElement: Element, transclusion: Transclusion): Element {
    if (transclusion.back && this.options.dereference.circular === 'replace') {
      const refElement = new RefElement(transclusion.refURI, {
        type: referencingElement.element,
        uri: transclusion.origin,
        [transclusion.kind === 'reusable' ? 'reference' : '$ref']: transclusion.refValue,
      });
      const replacer =
        this.options.dereference.strategyOpts['arazzo-1']?.circularReplacer ??
        this.options.dereference.circularReplacer;
      return replacer(refElement);
    }

    const target = transclusion.target.element;

    if (transclusion.kind === 'reusable') {
      const reusableElement = referencingElement as ReusableElement;
      const mergedElement = cloneShallow(target);
      // annotate with info about original referencing element
      mergedElement.meta.set('ref-fields', {
        reference: transclusion.refValue,
        value: toValue(reusableElement.value),
      });
      // annotate with info about origin
      mergedElement.meta.set('ref-origin', transclusion.origin);
      mergedElement.meta.set('ref-type', referencingElement.element);

      // override value field if present for Parameter Objects
      if (isParameterElement(mergedElement) && reusableElement.hasKey('value')) {
        mergedElement.remove('value');
        mergedElement.set('value', reusableElement.get('value'));
      }

      return mergedElement;
    }

    // Boolean JSON Schemas
    if (isBooleanJSONSchemaElement(target)) {
      const booleanJsonSchemaElement = cloneDeep<BooleanElement>(target);
      // annotate referenced element with info about original referencing element
      booleanJsonSchemaElement.meta.set('ref-fields', { $ref: transclusion.refValue });
      // annotate referenced element with info about origin
      booleanJsonSchemaElement.meta.set('ref-origin', transclusion.origin);
      booleanJsonSchemaElement.meta.set('ref-type', referencingElement.element);
      return booleanJsonSchemaElement;
    }

    if (!isJSONSchemaElement(target)) return target;

    /**
     * Creating a new version of JSON Schema by merging fields from referenced Schema with referencing one.
     */
    const mergedElement = cloneShallow<JSONSchemaElement>(target);
    // existing keywords from referencing schema overrides ones from referenced schema
    (referencingElement as JSONSchemaElement).forEach(
      (value: Element, keyElement: Element, item: Element) => {
        mergedElement.remove(toValue(keyElement) as string);
        (mergedElement.content as Element[]).push(item);
      },
    );
    mergedElement.remove('$ref');
    // annotate referenced element with info about original referencing element
    mergedElement.meta.set('ref-fields', { $ref: transclusion.refValue });
    // annotate fragment with info about origin
    mergedElement.meta.set('ref-origin', transclusion.origin);
    mergedElement.meta.set('ref-type', referencingElement.element);

    return mergedElement;
  }

  /**
   * Indexes the `$id`-bearing schemas of a document for the run. Transcluded elements aren't
   * indexed: they're copies of structures indexed where they're defined,
   * and in a document dereferenced in place their shared structure would be walked once per path.
   */
  protected index$ids(element: Element): void {
    if (this.schema$idIndex.has(element)) return;

    const entries: { schema: JSONSchemaElement; $ids: string[] }[] = [];
    traverse(element, {
      enter: (path: Path<Element>) => {
        if (this.isTranscluded(path.node)) {
          path.skip();
        } else if (isJSONSchemaElementWith$id(path.node)) {
          entries.push({ schema: path.node as JSONSchemaElement, $ids: collectSchema$ids(path) });
        }
      },
    });
    this.schema$idIndex.set(element, entries);
  }

  /**
   * Whether the element is transcluded in place of a referencing element, in this run or,
   * when dereferencing in place, in an earlier one: transcluded elements carry the `ref-origin` meta.
   */
  protected isTranscluded(element: Element): boolean {
    return (
      this.run.transcluded.has(element) ||
      (!element.isMetaEmpty && element.meta.hasKey('ref-origin'))
    );
  }

  /**
   * Dereferenced in place, a source may already hold transcluded elements.
   */
  public enter(path: Path<Element>) {
    if (this.isTranscluded(path.node)) {
      path.skip();
      return;
    }
    // a Source Description parsed into the document has its own components: it's dereferenced
    // in its own context by the strategy, never by the document referencing it
    if (
      path.parentPath !== null &&
      isParseResultElement(path.node) &&
      includesClasses(path.node, ['source-description'])
    ) {
      path.skip();
    }
  }

  public async ReusableElement(path: Path<Element>) {
    const referencingElement = path.node as ReusableElement;

    // the fields of a Reusable Object hold no references
    path.skip();

    // skip current Reusable Object if reference field is not defined as a string
    if (!isStringElement(referencingElement.reference)) {
      return;
    }

    // ignore if resolve.internal is false (Reusable Objects are internal references only)
    if (!this.options.resolve.internal) {
      return;
    }

    const runtimeExpression = toValue(referencingElement.reference) as string;

    try {
      // parse the runtime expression
      const { result, tree } = parseRuntimeExpression(runtimeExpression);

      if (!result.success) {
        throw new ApiDOMStructuredError(
          `Invalid Reusable Object reference format: "${runtimeExpression}"`,
          { runtimeExpression },
        );
      }

      // ReusableElement can only reference components
      if (tree.type !== 'ComponentsExpression') {
        throw new ApiDOMStructuredError(
          `Reusable Object reference "${runtimeExpression}" must be a components expression`,
          { runtimeExpression },
        );
      }

      // evaluate runtime expression as JSON Pointer to get the referenced element
      const jsonPointer = jsonPointerCompile([
        'components',
        tree.componentType,
        tree.componentName,
      ]);
      let referencedElement: Element;
      try {
        referencedElement = jsonPointerEvaluate<Element>(
          (this.reference.value as ParseResultElement).result as ArazzoSpecification1Element,
          jsonPointer,
        );
      } catch {
        throw new ApiDOMStructuredError(
          `Reusable Object reference "${runtimeExpression}" cannot be resolved`,
          { runtimeExpression },
        );
      }

      // the reference decides the type of the referenced component
      const type =
        (toValue(referencingElement.meta.get('referenced-element')) as string | undefined) ??
        referencedElement.element;

      await this.addTransclusion(path, referencedElement, type, this.reference, [], {
        kind: 'reusable',
        refValue: runtimeExpression,
        refURI: runtimeExpression,
        origin: this.reference.uri,
      });
    } catch (error: unknown) {
      // a referencing element is traversed again by every source containing it
      if (this.run.failed.has(referencingElement)) return;
      this.run.failed.add(referencingElement);
      this.handleError(
        `Error while dereferencing Reusable Object. Cannot resolve reference "${runtimeExpression}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        'reference',
        runtimeExpression,
        path,
      );
    }
  }

  public async JSONSchemaElement(path: Path<Element>) {
    const referencingElement = path.node as JSONSchemaElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    try {
      // compute baseURI using rules around $self, $id and $ref keywords
      let reference = await this.toReference(url.unsanitize(this.reference.uri));
      let { uri: retrievalURI } = reference;
      // base URI in effect at the traversal root: the document base refined by
      // the $ids of the schemas enclosing the root when the root is a fragment
      const rootBaseURI = resolveSchema$ids(this.baseURI, this.ancestorSchema$ids);
      const schemaBaseURI = resolveSchemaBaseURI(rootBaseURI, path);
      const $refBaseURI = resolveSchema$refField(schemaBaseURI, referencingElement)!;
      const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
      const file = new File({ uri: $refBaseURIStrippedHash });
      const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
      const isURL = !isUnknownURI;
      let isInternalReference = this.baseURI === $refBaseURI;
      let isExternalReference = !isInternalReference;

      // determining reference, proper evaluation and selection mechanism
      let referencedElement: Element;
      // $ids of the schemas enclosing the referenced element within its document
      let ancestorSchema$ids: string[];

      try {
        if (isUnknownURI || isURL) {
          // we're dealing with canonical URI or URL with possible fragment
          retrievalURI = this.toBaseURI($refBaseURI);
          const selector = $refBaseURI;
          const documentElement = (reference.value as ParseResultElement).result as Element;
          const referenceAsSchema = maybeRefractToJSONSchemaElement(documentElement);
          this.index$ids(referenceAsSchema);
          // a document that is itself a fragment detached from its source carries
          // the $ids enclosing it only as `ancestorSchema$ids`: its $ids are then
          // indexed against the base that chain leaves in effect, and the chain
          // prefixes the one of the located schema. A visitor rooted at a
          // fragment of a whole document indexes that document against its own base.
          const rootNode = path.getAncestorNodes().at(-1) ?? path.node;
          const isDocumentRoot =
            (isParseResultElement(rootNode) ? rootNode.result : rootNode) === documentElement;
          ({ element: referencedElement, ancestorSchema$ids } = uriLocate(
            selector,
            referenceAsSchema,
            {
              baseURI: isDocumentRoot ? rootBaseURI : this.baseURI,
              index: this.schema$idIndex,
            },
          ));
          if (isDocumentRoot) {
            ancestorSchema$ids = [...this.ancestorSchema$ids, ...ancestorSchema$ids];
          }

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
        } else {
          // we're assuming here that we're dealing with JSON Pointer here
          retrievalURI = this.toBaseURI($refBaseURI);
          isInternalReference = this.baseURI === retrievalURI;
          isExternalReference = !isInternalReference;

          // ignore resolving internal Schema Objects
          if (!this.options.resolve.internal && isInternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }
          // ignore resolving external Schema Objects
          if (!this.options.resolve.external && isExternalReference) {
            // skip traversing this schema element but traverse all its child elements
            return;
          }

          reference = await this.toReference(url.unsanitize($refBaseURI));
          const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
          const referenceAsSchema = maybeRefractToJSONSchemaElement(
            (reference.value as ParseResultElement).result as Element,
          );
          ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
            referenceAsSchema,
            selector,
          ));
        }
      } catch (error) {
        /**
         * JSONSchemaElement($id=URL) was not found, so we're going to try to resolve
         * the URL and assume the returned response is a JSON Schema.
         */
        if (isURL && error instanceof EvaluationJsonSchemaUriError) {
          if (isAnchor(uriToAnchor($refBaseURI))) {
            // we're dealing with JSON Schema $anchor here
            isInternalReference = this.baseURI === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = uriToAnchor($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (reference.value as ParseResultElement).result as Element,
            );
            ({ element: referencedElement, ancestorSchema$ids } = $anchorLocate(
              selector,
              referenceAsSchema,
            ));
          } else {
            // we're assuming here that we're dealing with JSON Pointer here
            retrievalURI = this.toBaseURI($refBaseURI);
            isInternalReference = this.baseURI === retrievalURI;
            isExternalReference = !isInternalReference;

            // ignore resolving internal Schema Objects
            if (!this.options.resolve.internal && isInternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }
            // ignore resolving external Schema Objects
            if (!this.options.resolve.external && isExternalReference) {
              // skip traversing this schema element but traverse all its child elements
              return;
            }

            reference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (reference.value as ParseResultElement).result as Element,
            );
            ({ element: referencedElement, ancestorSchema$ids } = jsonPointerLocate(
              referenceAsSchema,
              selector,
            ));
          }
        } else {
          throw error;
        }
      }

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive JSON Schema reference detected', {
          $ref: toValue(referencingElement.$ref),
        });
      }

      // a JSON Schema $ref reads whatever it points at as a JSON Schema
      await this.addTransclusion(
        path,
        referencedElement,
        JSON_SCHEMA_TYPE,
        reference,
        ancestorSchema$ids,
        {
          kind: 'schema',
          refValue: toValue(referencingElement.$ref) as string,
          refURI: $refBaseURI,
          origin: reference.uri,
        },
      );
    } catch (error: unknown) {
      // a referencing element is traversed again by every source containing it
      if (this.run.failed.has(referencingElement)) return;
      this.run.failed.add(referencingElement);
      const $ref = toValue(referencingElement.$ref) as string;
      this.handleError(
        `Error while dereferencing Schema Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }
}

export default Arazzo1DereferenceVisitor;
