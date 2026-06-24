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
import { toValue, toYAML, fixedFields } from '@speclynx/apidom-core';
import { traverseAsync, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate,
  escape,
  parse as parseJSONPointer,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  ReferenceElement,
  ChannelItemElement,
  ComponentsElement,
  ComponentsSchemasElement,
  ComponentsServersElement,
  ComponentsServerVariablesElement,
  ComponentsChannelsElement,
  ComponentsMessagesElement,
  ComponentsSecuritySchemesElement,
  ComponentsParametersElement,
  ComponentsCorrelationIDsElement,
  ComponentsOperationTraitsElement,
  ComponentsMessageTraitsElement,
  ComponentsServerBindingsElement,
  ComponentsChannelBindingsElement,
  ComponentsOperationBindingsElement,
  ComponentsMessageBindingsElement,
  AsyncApi2Element,
  isReferenceElement,
  isReferenceLikeElement,
  isChannelItemElement,
  refract,
  refractReference,
  refractChannelItem,
} from '@speclynx/apidom-ns-asyncapi-2';

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
  server: cf.servers.name,
  serverVariable: cf.serverVariables.name,
  channelItem: cf.channels.name,
  message: cf.messages.name,
  securityScheme: cf.securitySchemes.name,
  parameter: cf.parameters.name,
  correlationID: cf.correlationIds.name,
  operationTrait: cf.operationTraits.name,
  messageTrait: cf.messageTraits.name,
  serverBindings: cf.serverBindings.name,
  channelBindings: cf.channelBindings.name,
  operationBindings: cf.operationBindings.name,
  messageBindings: cf.messageBindings.name,
};

/**
 * Maps a Components Object field to the named-content element the namespace
 * uses for it, so a bundle-created field matches a parsed/refracted one
 * (e.g. carries the `components-schemas` class) rather than being a generic
 * object.
 */
const componentFieldElementByField: Record<string, new () => ObjectElement> = {
  [cf.schemas.name]: ComponentsSchemasElement,
  [cf.servers.name]: ComponentsServersElement,
  [cf.serverVariables.name]: ComponentsServerVariablesElement,
  [cf.channels.name]: ComponentsChannelsElement,
  [cf.messages.name]: ComponentsMessagesElement,
  [cf.securitySchemes.name]: ComponentsSecuritySchemesElement,
  [cf.parameters.name]: ComponentsParametersElement,
  [cf.correlationIds.name]: ComponentsCorrelationIDsElement,
  [cf.operationTraits.name]: ComponentsOperationTraitsElement,
  [cf.messageTraits.name]: ComponentsMessageTraitsElement,
  [cf.serverBindings.name]: ComponentsServerBindingsElement,
  [cf.channelBindings.name]: ComponentsChannelBindingsElement,
  [cf.operationBindings.name]: ComponentsOperationBindingsElement,
  [cf.messageBindings.name]: ComponentsMessageBindingsElement,
};

/**
 * @public
 */
export interface AsyncAPI2BundleVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly assignments?: Map<string, string>;
  readonly reservedNames?: Map<string, Set<string>>;
  readonly refractCache?: WeakMap<Element, Map<string, Element>>;
}

/**
 * @public
 */
class AsyncAPI2BundleVisitor {
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
   * AsyncApi2Element.
   */
  protected get entryResult(): AsyncApi2Element {
    return this.entryParseResult.result as AsyncApi2Element;
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
   * generic object referenced once as a Parameter and once as a Schema).
   */
  protected readonly refractCache: WeakMap<Element, Map<string, Element>>;

  constructor({
    reference,
    options,
    assignments = new Map<string, string>(),
    reservedNames = new Map<string, Set<string>>(),
    refractCache = new WeakMap(),
  }: AsyncAPI2BundleVisitorOptions) {
    this.reference = reference;
    this.options = options;
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
      this.options.bundle.strategyOpts['asyncapi-2']?.componentNamesStrategy ??
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

  /**
   * Reports a collision-forced rename according to the configured severity.
   * A rename means two distinct targets resolved to the same name; each keeps
   * its own component (and origin), so report the rename per severity.
   */
  protected reportNameCollision(preferredName: string, componentName: string, field: string): void {
    // strategy specific options take precedence over the top-level bundle options
    const onComponentNameCollision =
      this.options.bundle.strategyOpts['asyncapi-2']?.onComponentNameCollision ??
      this.options.bundle.onComponentNameCollision;
    if (componentName === preferredName || onComponentNameCollision === 'off') {
      return;
    }

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
    // identity: the same external target referenced as e.g. both a Schema and a
    // Message must be hoisted into both components fields. The refractor sets
    // `referenced-element` for every Reference Object position; the `schema`
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

      this.reportNameCollision(preferredName, componentName, field);

      // reserve the assignment and component name before recursing so cyclic
      // references terminate
      this.assignments.set(canonicalKey, internalPointer);
      if (!this.reservedNames.has(field)) this.reservedNames.set(field, new Set<string>());
      this.reservedNames.get(field)!.add(componentName);

      // own a copy of the fragment and bundle its own external references
      const hoistedElement = cloneDeep(referencedElement);
      const visitor = new AsyncAPI2BundleVisitor({
        reference,
        options: this.options,
        assignments: this.assignments,
        reservedNames: this.reservedNames,
        refractCache: this.refractCache,
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
   * AsyncAPI 2.0 has a `components.channels` field, so an external Channel Item
   * Object is hoisted there and the referencing `$ref` is rewritten to an
   * internal pointer — mirroring how Reference Objects are bundled. Sibling
   * fields next to the `$ref` (e.g. `description`) are kept on the referencing
   * element.
   */
  public async ChannelItemElement(path: Path<Element>) {
    const channelItemElement = path.node as ChannelItemElement;

    // ignore Channel Item Objects without a $ref field
    if (!isStringElement(channelItemElement.$ref)) {
      return;
    }

    const $ref = toValue(channelItemElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    if (isInternalReference) {
      // normalize self-references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      channelItemElement.set('$ref', this.normalizeSelfReference($ref));
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
    const field = cf.channels.name;
    const canonicalKey = `${field}\t${retrievalURI}#${jsonPointer}`;

    // already hoisted (or being hoisted) — just rewrite the pointer. The
    // assignment is reserved BEFORE recursing, so a circular Channel Item chain
    // terminates here with an internal pointer instead of recursing forever.
    if (this.assignments.has(canonicalKey)) {
      channelItemElement.set('$ref', this.assignments.get(canonicalKey)!);
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

      let referencedElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // apply Channel Item semantics to the referenced fragment
      if (!isChannelItemElement(referencedElement)) {
        const cached = this.getRefracted(referencedElement, 'channelItem');
        if (cached !== undefined) {
          referencedElement = cached;
        } else {
          const sourceElement = referencedElement;
          referencedElement = refractChannelItem(referencedElement);
          this.setRefracted(sourceElement, 'channelItem', referencedElement);
        }
      }

      const preferredName = this.baseName(referencedElement, field, jsonPointer, retrievalURI);
      const componentName = this.uniqueName(preferredName, field);
      const internalPointer = `#/components/${field}/${escape(componentName)}`;

      this.reportNameCollision(preferredName, componentName, field);

      // reserve the assignment and component name before recursing so cyclic
      // references terminate
      this.assignments.set(canonicalKey, internalPointer);
      if (!this.reservedNames.has(field)) this.reservedNames.set(field, new Set<string>());
      this.reservedNames.get(field)!.add(componentName);

      // own a copy of the fragment and bundle its own external references
      const hoistedElement = cloneDeep(referencedElement) as ChannelItemElement;
      const visitor = new AsyncAPI2BundleVisitor({
        reference,
        options: this.options,
        assignments: this.assignments,
        reservedNames: this.reservedNames,
        refractCache: this.refractCache,
      });
      const bundledElement = (await traverseAsync(hoistedElement, visitor, {
        mutable: true,
      })) as ChannelItemElement;

      // a `$ref` surviving on the hoisted Channel Item means it pointed at
      // another Channel Item (a chain or cycle); it has already been rewritten
      // to an internal `#/components/channels/...` pointer by the child traversal
      bundledElement.meta.set('ref-origin', reference.uri);

      // place the bundled Channel Item into the entry document's components
      this.ensureComponentsField(field).set(componentName, bundledElement);

      // rewrite the referencing Channel Item to point at the hoisted one, keeping
      // any sibling fields (e.g. description) next to the $ref
      channelItemElement.set('$ref', internalPointer);
      path.skip();
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling Channel Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        channelItemElement,
        '$ref',
        $ref,
        path,
      );
      path.skip();
    }
  }
}

export default AsyncAPI2BundleVisitor;
