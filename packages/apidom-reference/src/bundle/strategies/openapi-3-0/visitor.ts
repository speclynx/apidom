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
  cloneShallow,
} from '@speclynx/apidom-datamodel';
import { toValue, toYAML, fixedFields } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverseAsync, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate,
  escape,
  parse as parseJSONPointer,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  ReferenceElement,
  PathItemElement,
  ExampleElement,
  LinkElement,
  ComponentsElement,
  ComponentsSchemasElement,
  ComponentsResponsesElement,
  ComponentsParametersElement,
  ComponentsExamplesElement,
  ComponentsRequestBodiesElement,
  ComponentsHeadersElement,
  ComponentsSecuritySchemesElement,
  ComponentsLinksElement,
  ComponentsCallbacksElement,
  OpenApi3_0Element,
  isReferenceElement,
  isReferenceLikeElement,
  isPathItemElement,
  refract,
  refractReference,
  refractPathItem,
} from '@speclynx/apidom-ns-openapi-3-0';

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
 * Components Object field where the referenced element should be hoisted.
 * Field names are sourced from the Components Object fixed fields so they
 * cannot drift from the namespace definition.
 */
const cf = fixedFields(ComponentsElement, { indexed: true });
const componentFieldByReferencedElement: Record<string, string> = {
  schema: cf.schemas.name,
  response: cf.responses.name,
  parameter: cf.parameters.name,
  example: cf.examples.name,
  requestBody: cf.requestBodies.name,
  header: cf.headers.name,
  securityScheme: cf.securitySchemes.name,
  link: cf.links.name,
  callback: cf.callbacks.name,
};

/**
 * Maps a Components Object field to the named-content element the namespace
 * uses for it, so a bundle-created field matches a parsed/refracted one
 * (e.g. carries the `components-schemas` class) rather than being a generic
 * object.
 */
const componentFieldElementByField: Record<string, new () => ObjectElement> = {
  [cf.schemas.name]: ComponentsSchemasElement,
  [cf.responses.name]: ComponentsResponsesElement,
  [cf.parameters.name]: ComponentsParametersElement,
  [cf.examples.name]: ComponentsExamplesElement,
  [cf.requestBodies.name]: ComponentsRequestBodiesElement,
  [cf.headers.name]: ComponentsHeadersElement,
  [cf.securitySchemes.name]: ComponentsSecuritySchemesElement,
  [cf.links.name]: ComponentsLinksElement,
  [cf.callbacks.name]: ComponentsCallbacksElement,
};

/**
 * @public
 */
export interface OpenAPI3_0BundleVisitorOptions {
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
class OpenAPI3_0BundleVisitor {
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
   * `components` object. The `canBundle` guard guarantees it is an
   * OpenApi3_0Element.
   */
  protected get entryResult(): OpenApi3_0Element {
    return this.entryParseResult.result as OpenApi3_0Element;
  }

  /**
   * Shared across the entry document and every external document visitor.
   * Guarantees each external fragment is hoisted exactly once and gives us a
   * stable internal pointer to rewrite every referencing element to.
   */
  protected readonly assignments: Map<string, string>;

  /**
   * Component names already reserved per Components Object field. Reserved
   * before recursion so collision suffixing (`Pet`, `Pet-2`, ...) accounts for
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
   * are not hoisted into Components Object (no `components.pathItems` in
   * OpenAPI 3.0), so the `assignments` map can't break their cycles. This
   * stack guards against circular external Path Item references.
   */
  protected readonly inlineStack: Set<string>;

  constructor({
    reference,
    options,
    assignments = new Map<string, string>(),
    reservedNames = new Map<string, Set<string>>(),
    refractCache = new WeakMap(),
    inlineStack = new Set<string>(),
  }: OpenAPI3_0BundleVisitorOptions) {
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
   * Normalizes a self-reference (e.g. `./root.json#/components/schemas/Pet`)
   * to a bare fragment (`#/components/schemas/Pet`) so the bundled document stays
   * transferable. Bare fragments are returned unchanged.
   */
  protected normalizeSelfReference(ref: string): string {
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
   * Lazily creates the Components Object (and the requested field within it)
   * on the entry document, returning the field where a fragment is hoisted.
   */
  protected ensureComponentsField(field: string): ObjectElement {
    const entryResult = this.entryResult;
    let components = entryResult.components;
    if (!isObjectElement(components)) {
      components = new ComponentsElement();
      entryResult.components = components;
    }

    let fieldElement = components.get(field) as ObjectElement | undefined;
    if (!isObjectElement(fieldElement)) {
      const FieldElement = componentFieldElementByField[field] ?? ObjectElement;
      fieldElement = new FieldElement();
      components.set(field, fieldElement);
    }

    return fieldElement;
  }

  /**
   * Derives a component name from the referenced JSON Pointer's last token,
   * falling back to the referenced file's basename.
   */
  protected basenameOf(jsonPointer: string, baseURI: string): string {
    const tokens = parseJSONPointer(jsonPointer).tree as string[];
    const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : '';
    return lastToken || url.getBasename(baseURI) || 'Schema';
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
      this.options.bundle.strategyOpts['openapi-3-0']?.componentNamesStrategy ??
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
   * taken if it's already placed in components or reserved by a component that
   * is still being bundled (reserved before recursion).
   */
  protected uniqueName(candidate: string, field: string): string {
    const fieldElement = this.ensureComponentsField(field);
    const reserved = this.reservedNames.get(field) ?? new Set<string>();
    return resolveUniqueName(candidate, (name) => fieldElement.hasKey(name) || reserved.has(name));
  }

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;
    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    if (isInternalReference) {
      // normalize self-references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      referencingElement.set('$ref', this.normalizeSelfReference($ref));
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

    // the target bucket depends on the referencing context, so it's part of the
    // identity: the same external target referenced as e.g. both a parameter and
    // a response must be hoisted into both components fields. The refractor sets
    // `referenced-element` for every Reference Object position; the `schemas`
    // fallback is a defensive default for the (unexpected) untagged case.
    const referencedElementType = referencingElement.meta.get('referenced-element') as string;
    const field =
      componentFieldByReferencedElement[referencedElementType] ??
      componentFieldByReferencedElement.schema;
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
        !isReferenceElement(referencedElement)
      ) {
        const cached = this.getRefracted(referencedElement, referencedElementType);
        if (cached !== undefined) {
          referencedElement = cached;
        } else if (isReferenceLikeElement(referencedElement)) {
          const sourceElement = referencedElement;
          referencedElement = refractReference(referencedElement);
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
      const internalPointer = `#/components/${field}/${escape(componentName)}`;

      // a rename means two distinct targets resolved to the same name; each
      // keeps its own component (and origin), so report the rename per severity.
      // strategy specific options take precedence over the top-level bundle options
      const onComponentNameCollision =
        this.options.bundle.strategyOpts['openapi-3-0']?.onComponentNameCollision ??
        this.options.bundle.onComponentNameCollision;
      if (componentName !== preferredName && onComponentNameCollision !== 'off') {
        const message = `Component "${preferredName}" in components/${field} is referenced with the same name but different content. Renamed to "${componentName}".`;
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
      const visitor = new OpenAPI3_0BundleVisitor({
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

      // place the bundled fragment into the entry document's components
      this.ensureComponentsField(field).set(componentName, bundledElement);

      // rewrite the referencing element to point at the hoisted fragment
      referencingElement.set('$ref', internalPointer);
      path.skip();
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling Reference Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
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
   * Path Item Object is not a Components Object field in OpenAPI 3.0
   * (unlike 3.1 which has `components.pathItems`). An external Path Item
   * reference therefore cannot be hoisted; it is inlined in place instead,
   * after bundling its own external references.
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
      // normalize self-references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      pathItemElement.set('$ref', this.normalizeSelfReference($ref));
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
      const visitor = new OpenAPI3_0BundleVisitor({
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

  /**
   * Example Object `externalValue` points at arbitrary external content that
   * has no place in the Components Object. The referenced value is inlined into
   * the Example's `value` field.
   */
  public async ExampleElement(path: Path<Element>) {
    const exampleElement = path.node as ExampleElement;

    // ignore Example Objects without an externalValue field
    if (!isStringElement(exampleElement.externalValue)) {
      return;
    }

    // value and externalValue fields are mutually exclusive
    if (exampleElement.hasKey('value') && isStringElement(exampleElement.externalValue)) {
      throw new ApiDOMStructuredError(
        'ExampleElement value and externalValue fields are mutually exclusive',
        {
          value: toValue(exampleElement.value),
          externalValue: toValue(exampleElement.externalValue),
        },
      );
    }

    const externalValue = toValue(exampleElement.externalValue) as string;
    const retrievalURI = this.toBaseURI(externalValue);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    try {
      const reference = await this.toReference(externalValue);
      const valueElement = cloneShallow((reference.value as ParseResultElement).result as Element);
      valueElement.meta.set('ref-origin', reference.uri);

      const exampleElementCopy = cloneShallow(exampleElement);
      exampleElementCopy.value = valueElement;
      exampleElementCopy.remove('externalValue');

      path.replaceWith(exampleElementCopy);
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling Example Object. Cannot resolve externalValue "${externalValue}": ${(error as Error).message}`,
        error as Error,
        exampleElement,
        'externalValue',
        externalValue,
        path,
      );
    }
  }

  /**
   * Link Object `operationRef` points at an Operation Object, which has no
   * Components Object field in OpenAPI 3.0 and therefore cannot be hoisted or
   * inlined. To keep the link resolvable from the bundled document, an external
   * `operationRef` is rewritten to its absolute URI. Internal `operationRef`
   * values and `operationId` links are left untouched.
   */
  public async LinkElement(path: Path<Element>) {
    const linkElement = path.node as LinkElement;

    // operationRef and operationId fields are mutually exclusive
    if (isStringElement(linkElement.operationRef) && isStringElement(linkElement.operationId)) {
      throw new ApiDOMStructuredError(
        'LinkElement operationRef and operationId fields are mutually exclusive',
        {
          operationRef: toValue(linkElement.operationRef),
          operationId: toValue(linkElement.operationId),
        },
      );
    }

    // only external operationRef links need adjusting
    if (!isStringElement(linkElement.operationRef)) {
      return;
    }

    const operationRef = toValue(linkElement.operationRef) as string;
    const retrievalURI = this.toBaseURI(operationRef);
    const isInternalReference = this.entryURI === retrievalURI;

    if (isInternalReference) {
      // normalize a self-reference operationRef to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      linkElement.set('operationRef', this.normalizeSelfReference(operationRef));
      return;
    }

    // honor the resolve.external switch
    if (!this.options.resolve.external) {
      return;
    }

    // rewrite to an absolute URI so the link keeps resolving once the document
    // is treated as self-contained
    const absoluteURI = url.resolve(this.reference.uri, operationRef);
    if (absoluteURI !== operationRef) {
      linkElement.set('operationRef', absoluteURI);
    }
  }
}

export default OpenAPI3_0BundleVisitor;
