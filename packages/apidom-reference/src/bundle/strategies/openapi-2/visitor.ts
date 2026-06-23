import { propEq } from 'ramda';
import {
  isElement,
  isObjectElement,
  isStringElement,
  Element,
  ObjectElement,
  ParseResultElement,
  AnnotationElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import { traverseAsync, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate,
  escape,
  parse as parseJSONPointer,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  ReferenceElement,
  JSONReferenceElement,
  PathItemElement,
  DefinitionsElement,
  ParametersDefinitionsElement,
  ResponsesDefinitionsElement,
  SwaggerElement,
  isReferenceElement,
  isJSONReferenceElement,
  isReferenceLikeElement,
  isJSONReferenceLikeElement,
  isPathItemElement,
  refract,
  refractReference,
  refractJSONReference,
  refractPathItem,
} from '@speclynx/apidom-ns-openapi-2';

import BundleError from '../../../errors/BundleError.ts';
import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import MaximumBundleDepthError from '../../../errors/MaximumBundleDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import {
  toPascalCase,
  sanitizeComponentName,
  uniqueName as resolveUniqueName,
} from '../../util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Maps the `referenced-element` meta value (set during refraction) to the
 * top-level Swagger Object field where the referenced element should be
 * hoisted. Unlike OpenAPI 3.x, OpenAPI 2.0 has no single Components Object;
 * reusable definitions live directly under the document root.
 */
const fieldByReferencedElement: Record<string, string> = {
  schema: 'definitions',
  parameter: 'parameters',
  response: 'responses',
};

/**
 * Maps a top-level Swagger Object field to the named-content element the
 * namespace uses for it, so a bundle-created field matches a parsed/refracted
 * one (e.g. carries the `definitions` class) rather than being a generic
 * object.
 */
const fieldElementByField: Record<string, new () => ObjectElement> = {
  definitions: DefinitionsElement,
  parameters: ParametersDefinitionsElement,
  responses: ResponsesDefinitionsElement,
};

/**
 * @public
 */
export interface OpenAPI2BundleVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly assignments?: Map<string, string>;
  readonly reservedNames?: Map<string, Set<string>>;
  readonly refractCache?: WeakMap<Element, Map<string, Element>>;
  readonly inlineStack?: Set<string>;
}

/**
 * @public
 */
class OpenAPI2BundleVisitor {
  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  /**
   * The base URI (without hash) of the entry document. A reference is
   * considered internal when it resolves to this URI and external otherwise.
   * Derived from the shared refSet's root reference.
   */
  protected get entryURI(): string {
    return url.stripHash(this.reference.refSet?.rootRef?.uri ?? '');
  }

  /**
   * The entry parse result. Derived from the shared refSet's root reference.
   */
  protected get entryParseResult(): ParseResultElement {
    return this.reference.refSet!.rootRef!.value as ParseResultElement;
  }

  /**
   * The entry document element. Hoisted external fragments are placed into its
   * top-level definition fields. The `canBundle` guard guarantees it is a
   * SwaggerElement.
   */
  protected get entryResult(): SwaggerElement {
    return this.entryParseResult.result as SwaggerElement;
  }

  /**
   * Shared across the entry document and every external document visitor.
   * Guarantees each external fragment is hoisted exactly once and gives us a
   * stable internal pointer to rewrite every referencing element to.
   */
  protected readonly assignments: Map<string, string>;

  /**
   * Component names already reserved per definition field. Reserved before
   * recursion so collision suffixing (`Pet`, `Pet-2`, ...) accounts for
   * components that are still being bundled.
   */
  protected readonly reservedNames: Map<string, Set<string>>;

  /**
   * Caches refracted fragments keyed by source element and target element type.
   * The type is part of the key because the same source can be refracted into
   * different semantic elements depending on the referencing context (e.g. a
   * generic object referenced once as a Parameter and once as a Response).
   */
  protected readonly refractCache: WeakMap<Element, Map<string, Element>>;

  /**
   * Canonical URIs of Path Item Objects currently being inlined. Path Items
   * are not a top-level definition field in OpenAPI 2.0, so the `assignments`
   * map can't break their cycles. This stack guards against circular external
   * Path Item references.
   */
  protected readonly inlineStack: Set<string>;

  constructor({
    reference,
    options,
    assignments = new Map<string, string>(),
    reservedNames = new Map<string, Set<string>>(),
    refractCache = new WeakMap(),
    inlineStack = new Set<string>(),
  }: OpenAPI2BundleVisitorOptions) {
    this.reference = reference;
    this.options = options;
    this.inlineStack = inlineStack;
    this.assignments = assignments;
    this.reservedNames = reservedNames;
    this.refractCache = refractCache;
  }

  protected getRefracted(source: Element, type: string): Element | undefined {
    return this.refractCache.get(source)?.get(type);
  }

  protected setRefracted(source: Element, type: string, refracted: Element): void {
    let byType = this.refractCache.get(source);
    if (byType === undefined) {
      byType = new Map<string, Element>();
      this.refractCache.set(source, byType);
    }
    byType.set(type, refracted);
  }

  protected toBaseURI(uri: string): string {
    return url.resolve(this.reference.uri, url.sanitize(url.stripHash(uri)));
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

    const parseResult = await parse(url.unsanitize(baseURI), {
      ...this.options,
      parse: { ...this.options.parse, mediaType: 'text/plain' },
    });

    const reference = new Reference({
      uri: baseURI,
      value: parseResult,
      depth: this.reference.depth + 1,
    });
    refSet.add(reference);

    return reference;
  }

  /**
   * Normalizes a self-file reference (e.g. `./root.json#/definitions/Pet`)
   * to a bare fragment (`#/definitions/Pet`) so the bundled document stays
   * transferable. Bare fragments are returned unchanged.
   */
  protected normalizeSelfFileRef(ref: string): string {
    return ref.startsWith('#') ? ref : url.getHash(ref);
  }

  /**
   * Handles an error according to the `bundle.continueOnError` option.
   *
   * For new errors: wraps in UnresolvableReferenceError with structured
   * context. For errors already wrapped by a nested visitor: prepends the
   * current hop to the trace.
   *
   * Inner/intermediate visitors always throw to let the trace accumulate. Only
   * the entry document visitor respects continueOnError (callback/swallow/throw).
   */
  protected handleError(
    message: string,
    error: Error,
    referencingElement: Element,
    refFieldName: string,
    refFieldValue: string,
    visitorPath: Path<Element>,
  ): void {
    // a collision reported as `error` is a deliberate hard stop with no
    // resolution-failure analog, so pass it through unchanged. A maxDepth
    // breach (MaximumBundleDepthError, which also extends BundleError) is a
    // resolution failure and flows through below — wrapped and subject to
    // continueOnError, like dereferencing.
    if (error instanceof BundleError && !(error instanceof MaximumBundleDepthError)) {
      throw error;
    }

    const { continueOnError } = this.options.bundle;
    const isEntryDocument =
      url.stripHash(this.reference.refSet?.rootRef?.uri ?? '') === this.reference.uri;
    const uri = this.reference.uri;
    const type = referencingElement.element as string;
    const codeFrame = toYAML(referencingElement);
    const location = visitorPath.formatPath();
    const hop = { uri, type, refFieldName, refFieldValue, location, codeFrame };

    let unresolvedError: UnresolvableReferenceError;
    if (error instanceof UnresolvableReferenceError) {
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
   * Lazily creates the requested top-level definition field on the entry
   * document, returning the field where a fragment is hoisted.
   */
  protected ensureField(field: string): ObjectElement {
    const entryResult = this.entryResult;

    let fieldElement = entryResult.get(field) as ObjectElement | undefined;
    if (!isObjectElement(fieldElement)) {
      const FieldElement = fieldElementByField[field] ?? ObjectElement;
      fieldElement = new FieldElement();
      entryResult.set(field, fieldElement);
    }

    return fieldElement;
  }

  /**
   * Derives a component name from the referenced JSON Pointer's last token,
   * falling back to the referenced file's basename.
   */
  protected basenameOf(jsonPointer: string, baseURI: string): string {
    const tokens = parseJSONPointer(jsonPointer).tree as string[];
    let candidate = tokens.length > 0 ? tokens[tokens.length - 1] : '';
    if (candidate === '') {
      const lastSlash = baseURI.lastIndexOf('/');
      const lastDot = baseURI.lastIndexOf('.');
      const fileName = baseURI.slice(lastSlash + 1);
      // strip the extension only when the last dot belongs to the file name
      candidate = lastDot > lastSlash ? baseURI.slice(lastSlash + 1, lastDot) : fileName;
    }
    if (candidate === '') candidate = 'Schema';
    return candidate;
  }

  /**
   * Computes the base component name (before collision suffixing) according to
   * the configured naming strategy.
   */
  protected baseName(
    element: Element,
    field: string,
    jsonPointer: string,
    baseURI: string,
  ): string {
    // strategy specific options take precedence over the top-level bundle options
    const componentNamesStrategy =
      this.options.bundle.strategyOpts['openapi-2']?.componentNamesStrategy ??
      this.options.bundle.componentNamesStrategy;

    if (typeof componentNamesStrategy === 'function') {
      const resolved = componentNamesStrategy({ element, field, jsonPointer, baseURI });
      if (typeof resolved === 'string' && resolved !== '') {
        return resolved;
      }
      return this.basenameOf(jsonPointer, baseURI);
    }

    if (componentNamesStrategy === 'title') {
      const title = isObjectElement(element) ? toValue(element.get('title')) : undefined;
      if (typeof title === 'string' && title.trim() !== '') {
        const name = sanitizeComponentName(toPascalCase(title));
        if (name !== '') return name;
      }
      // fall back to basename when no usable title is present
    }

    return this.basenameOf(jsonPointer, baseURI);
  }

  /**
   * Computes a collision-free component name within the target field. A name is
   * taken if it's already placed in the field or reserved by a component that
   * is still being bundled (reserved before recursion).
   */
  protected uniqueName(candidate: string, field: string): string {
    const fieldElement = this.ensureField(field);
    const reserved = this.reservedNames.get(field) ?? new Set<string>();
    return resolveUniqueName(candidate, (name) => fieldElement.hasKey(name) || reserved.has(name));
  }

  /**
   * Bundles a Reference Object (parameters/responses) or a JSON Reference
   * Object (schemas). The two reference flavors differ only in their predicate
   * and refraction helpers, so the shared logic is parameterized here.
   */
  protected async bundleReference(
    path: Path<Element>,
    referencingElement: ReferenceElement | JSONReferenceElement,
    isSemanticReference: (element: Element) => boolean,
    isReferenceLike: (element: Element) => boolean,
    refractReferenceFn: (element: Element) => Element,
    label: string,
  ): Promise<void> {
    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    if (isInternalReference) {
      // normalize self-file references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      referencingElement.set('$ref', this.normalizeSelfFileRef($ref));
      path.skip();
      return;
    }

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      path.skip();
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);
    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);

    // the target field depends on the referencing context, so it's part of the
    // identity: the same external target referenced as e.g. both a parameter and
    // a response must be hoisted into both fields. The refractor sets
    // `referenced-element` for every Reference Object position; the `schema`
    // fallback is a defensive default for the (unexpected) untagged case.
    const referencedElementType = referencingElement.meta.get('referenced-element') as string;
    const field =
      fieldByReferencedElement[referencedElementType] ?? fieldByReferencedElement.schema;
    const canonicalKey = `${field}\t${retrievalURI}#${jsonPointer}`;

    // already hoisted (or being hoisted) — just rewrite the pointer.
    //
    // this is also how circular references terminate: the assignment is
    // reserved BEFORE recursing into the fragment (see below), so a reference
    // that cycles back (directly or indirectly) finds its pointer already
    // reserved here and is rewritten without recursing. Cycles are deliberately
    // preserved as internal `$ref`s pointing at each other — that is valid,
    // serializable output; resolving the cycle (if desired) is dereferencing's
    // job, not bundling's.
    if (this.assignments.has(canonicalKey)) {
      referencingElement.set('$ref', this.assignments.get(canonicalKey)!);
      path.skip();
      return;
    }

    try {
      // detect maximum depth of bundling
      if (this.reference.depth >= this.options.bundle.maxDepth) {
        throw new MaximumBundleDepthError(
          `Maximum bundle depth of "${this.options.bundle.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.bundle.maxDepth, uri: this.reference.uri },
        );
      }

      const reference = await this.toReference($ref);

      // possibly non-semantic fragment
      let referencedElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // apply semantics to the fragment so nested references become Reference Objects
      if (
        referencedElement.element !== referencedElementType &&
        !isSemanticReference(referencedElement)
      ) {
        const cached = this.getRefracted(referencedElement, referencedElementType);
        if (cached !== undefined) {
          referencedElement = cached;
        } else if (isReferenceLike(referencedElement)) {
          const sourceElement = referencedElement;
          referencedElement = refractReferenceFn(referencedElement);
          referencedElement.meta.set('referenced-element', referencedElementType);
          this.setRefracted(sourceElement, referencedElementType, referencedElement);
        } else {
          const sourceElement = referencedElement;
          referencedElement = refract(referencedElement, { element: referencedElementType });
          this.setRefracted(sourceElement, referencedElementType, referencedElement);
        }
      }

      const preferredName = this.baseName(referencedElement, field, jsonPointer, retrievalURI);
      const componentName = this.uniqueName(preferredName, field);
      const internalPointer = `#/${field}/${escape(componentName)}`;

      // a rename means two distinct targets resolved to the same name; each
      // keeps its own component (and origin), so report the rename per severity.
      // strategy specific options take precedence over the top-level bundle options
      const onComponentNameCollision =
        this.options.bundle.strategyOpts['openapi-2']?.onComponentNameCollision ??
        this.options.bundle.onComponentNameCollision;
      if (componentName !== preferredName && onComponentNameCollision !== 'off') {
        const message = `Component "${preferredName}" in ${field} is referenced with the same name but different content. Renamed to "${componentName}".`;
        if (onComponentNameCollision === 'error') {
          throw new BundleError(message);
        }
        const annotation = new AnnotationElement(message);
        annotation.classes.push('warning');
        annotation.code = 'bundle-component-name-collision';
        // append (never prepend) so the result element stays ahead of annotations
        (this.entryParseResult.content as Element[]).push(annotation);
      }

      // reserve the assignment and component name before recursing so cyclic
      // references terminate
      this.assignments.set(canonicalKey, internalPointer);
      if (!this.reservedNames.has(field)) this.reservedNames.set(field, new Set<string>());
      this.reservedNames.get(field)!.add(componentName);

      // own a copy of the fragment and bundle its own external references
      const hoistedElement = cloneDeep(referencedElement);
      const visitor = new OpenAPI2BundleVisitor({
        reference,
        options: this.options,
        assignments: this.assignments,
        reservedNames: this.reservedNames,
        refractCache: this.refractCache,
        inlineStack: this.inlineStack,
      });
      const bundledElement = await traverseAsync(hoistedElement, visitor, { mutable: true });

      // annotate the hoisted fragment with info about its origin
      if (isElement(bundledElement)) {
        bundledElement.meta.set('ref-origin', reference.uri);
      }

      // place the bundled fragment into the entry document's definitions
      this.ensureField(field).set(componentName, bundledElement);

      // rewrite the referencing element to point at the hoisted fragment
      referencingElement.set('$ref', internalPointer);
      path.skip();
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling ${label}. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
      path.skip();
    }
  }

  /**
   * Reference Object covers reusable Parameter and Response Objects, which are
   * hoisted into the top-level `parameters` and `responses` fields.
   */
  public async ReferenceElement(path: Path<Element>) {
    await this.bundleReference(
      path,
      path.node as ReferenceElement,
      isReferenceElement,
      isReferenceLikeElement,
      refractReference,
      'Reference Object',
    );
  }

  /**
   * JSON Reference Object covers reusable Schema Objects, which are hoisted
   * into the top-level `definitions` field.
   */
  public async JSONReferenceElement(path: Path<Element>) {
    await this.bundleReference(
      path,
      path.node as JSONReferenceElement,
      isJSONReferenceElement,
      isJSONReferenceLikeElement,
      refractJSONReference,
      'JSON Reference Object',
    );
  }

  /**
   * Path Item Object is not a top-level definition field in OpenAPI 2.0, so an
   * external Path Item reference cannot be hoisted; it is inlined in place
   * instead, after bundling its own external references.
   */
  public async PathItemElement(path: Path<Element>) {
    const pathItemElement = path.node as PathItemElement;

    // ignore Path Item Objects without a $ref field
    if (!isStringElement(pathItemElement.$ref)) {
      return;
    }

    const $ref = toValue(pathItemElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    if (isInternalReference) {
      // normalize self-file references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      pathItemElement.set('$ref', this.normalizeSelfFileRef($ref));
      return;
    }

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);
    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
    const canonicalKey = `${retrievalURI}#${jsonPointer}`;

    // a circular external Path Item reference cannot be inlined without
    // recursing forever; leave the $ref in place to break the cycle
    if (this.inlineStack.has(canonicalKey)) {
      return;
    }

    try {
      // detect maximum depth of bundling
      if (this.reference.depth >= this.options.bundle.maxDepth) {
        throw new MaximumBundleDepthError(
          `Maximum bundle depth of "${this.options.bundle.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.bundle.maxDepth, uri: this.reference.uri },
        );
      }

      const reference = await this.toReference($ref);

      let referencedElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // apply Path Item semantics to the referenced fragment
      if (!isPathItemElement(referencedElement)) {
        const cached = this.getRefracted(referencedElement, 'pathItem');
        if (cached !== undefined) {
          referencedElement = cached;
        } else {
          const sourceElement = referencedElement;
          referencedElement = refractPathItem(referencedElement);
          this.setRefracted(sourceElement, 'pathItem', referencedElement);
        }
      }

      // own a copy and bundle the external references it contains
      const inlinedElement = cloneDeep(referencedElement) as PathItemElement;
      this.inlineStack.add(canonicalKey);
      const visitor = new OpenAPI2BundleVisitor({
        reference,
        options: this.options,
        assignments: this.assignments,
        reservedNames: this.reservedNames,
        refractCache: this.refractCache,
        inlineStack: this.inlineStack,
      });
      let bundledElement: PathItemElement;
      try {
        bundledElement = (await traverseAsync(inlinedElement, visitor, {
          mutable: true,
        })) as PathItemElement;
      } finally {
        this.inlineStack.delete(canonicalKey);
      }

      // merge sibling fields from the referencing Path Item over the referenced
      // one. The referencing `$ref` is being resolved away and is skipped; the
      // referenced element keeps its own `$ref` if one survived (i.e. it was
      // left in place to break a circular external Path Item chain).
      pathItemElement.forEach((_value: Element, keyElement: Element, item: Element) => {
        const key = toValue(keyElement) as string;
        if (key === '$ref') return;
        bundledElement.remove(key);
        (bundledElement.content as Element[]).push(item);
      });
      bundledElement.meta.set('ref-origin', reference.uri);

      path.replaceWith(bundledElement);
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling Path Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        pathItemElement,
        '$ref',
        $ref,
        path,
      );
    }
  }
}

export default OpenAPI2BundleVisitor;
