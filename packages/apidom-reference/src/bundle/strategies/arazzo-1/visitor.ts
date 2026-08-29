import { none } from 'ramda';
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
  evaluate as jsonPointerEvaluate,
  escape,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  JSONSchemaElement,
  ComponentsElement,
  ComponentsInputsElement,
  ArazzoSpecification1Element,
} from '@speclynx/apidom-ns-arazzo-1';

import BundleError from '../../../errors/BundleError.ts';
import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import MaximumBundleDepthError from '../../../errors/MaximumBundleDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import EvaluationJsonSchemaUriError from '../../../errors/EvaluationJsonSchemaUriError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import File from '../../../File.ts';
import Resolver from '../../../resolve/resolvers/Resolver.ts';
import {
  isAnchor,
  uriToAnchor,
  evaluate as $anchorEvaluate,
} from '../../../dereference/strategies/arazzo-1/selectors/$anchor.ts';
import { evaluate as uriEvaluate } from '../../../dereference/strategies/arazzo-1/selectors/uri.ts';
import {
  resolveSchema$refField,
  resolveSchema$idField,
  maybeRefractToJSONSchemaElement,
  resolveArazzo$selfField,
  has$self,
} from '../../../dereference/strategies/arazzo-1/util.ts';
import {
  toPascalCase,
  sanitizeComponentName,
  uniqueName as resolveUniqueName,
} from '../../util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * The Components Object field where embedded JSON Schema resources are hoisted.
 * Sourced from the Components Object fixed fields so it cannot drift from the
 * namespace definition.
 */
const cf = fixedFields(ComponentsElement, { indexed: true });

/**
 * @public
 */
export interface Arazzo1BundleVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly assignments?: Map<string, string>;
  readonly reservedNames?: Map<string, Set<string>>;
}

/**
 * @public
 */
class Arazzo1BundleVisitor {
  protected readonly reference: Reference;

  /**
   * Base URI of the current document for resolving relative references.
   * Honors the Arazzo `$self` field when present, otherwise falls back
   * to the retrieval URI (`this.reference.uri`).
   */
  protected readonly baseURI: string;

  protected readonly options: ReferenceOptions;

  /**
   * The entry parse result. Derived from the shared refSet's root reference.
   */
  protected get entryParseResult(): ParseResultElement {
    return this.reference.refSet!.rootRef!.value as ParseResultElement;
  }

  /**
   * The entry document element. Embedded external schema resources are placed
   * into its `components.inputs` object. The `canBundle` guard guarantees it is
   * an ArazzoSpecification1Element.
   */
  protected get entryResult(): ArazzoSpecification1Element {
    return this.entryParseResult.result as ArazzoSpecification1Element;
  }

  /**
   * Shared across the entry document and every external document visitor.
   * Guarantees each external resource is embedded exactly once, keyed by its
   * resource URI.
   */
  protected readonly assignments: Map<string, string>;

  /**
   * Component names already reserved per Components Object field. Reserved
   * before recursion so collision suffixing (`Pet`, `Pet-2`, ...) accounts for
   * components that are still being bundled.
   */
  protected readonly reservedNames: Map<string, Set<string>>;

  constructor({
    reference,
    options,
    assignments = new Map<string, string>(),
    reservedNames = new Map<string, Set<string>>(),
  }: Arazzo1BundleVisitorOptions) {
    this.reference = reference;
    this.baseURI = resolveArazzo$selfField(
      reference.uri,
      (reference.value as ParseResultElement | undefined)?.result,
    );
    this.options = options;
    this.assignments = assignments;
    this.reservedNames = reservedNames;
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
      return refSet.find((ref) => ref.uri === baseURI)!;
    }

    // identity-based referencing: URI matches `$self` of an already processed Arazzo document
    const referenceBy$self = refSet.find(has$self(baseURI));
    if (referenceBy$self !== undefined) {
      return referenceBy$self;
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
   * Lazily creates the Components Object (and the `inputs` field within it) on
   * the entry document, returning the field where a resource is embedded.
   */
  protected ensureInputsField(): ObjectElement {
    const entryResult = this.entryResult;
    let components = entryResult.components;
    if (!isObjectElement(components)) {
      components = new ComponentsElement();
      entryResult.components = components;
    }

    let inputs = components.get(cf.inputs.name) as ObjectElement | undefined;
    if (!isObjectElement(inputs)) {
      inputs = new ComponentsInputsElement();
      components.set(cf.inputs.name, inputs);
    }

    return inputs;
  }

  /**
   * Computes the base component name (before collision suffixing) according to
   * the configured naming strategy.
   */
  protected baseName(element: Element, baseURI: string): string {
    // strategy specific options take precedence over the top-level bundle options
    const componentNamesStrategy =
      this.options.bundle.strategyOpts['arazzo-1']?.componentNamesStrategy ??
      this.options.bundle.componentNamesStrategy;

    const fallback = url.getBasename(baseURI) || 'Schema';

    if (typeof componentNamesStrategy === 'function') {
      const resolved = componentNamesStrategy({
        element,
        field: cf.inputs.name,
        jsonPointer: '',
        baseURI,
      });
      if (typeof resolved === 'string' && resolved !== '') {
        return resolved;
      }
      return fallback;
    }

    if (componentNamesStrategy === 'title') {
      const title = isObjectElement(element) ? toValue(element.get('title')) : undefined;
      if (typeof title === 'string' && title.trim() !== '') {
        const name = sanitizeComponentName(toPascalCase(title));
        if (name !== '') return name;
      }
      // fall back to basename when no usable title is present
    }

    return fallback;
  }

  /**
   * Computes a collision-free component name within `components.inputs`. A name
   * is taken if it's already placed in inputs or reserved by a component that is
   * still being bundled (reserved before recursion).
   */
  protected uniqueName(candidate: string): string {
    const field = cf.inputs.name;
    const inputs = this.ensureInputsField();
    const reserved = this.reservedNames.get(field) ?? new Set<string>();
    return resolveUniqueName(candidate, (name) => inputs.hasKey(name) || reserved.has(name));
  }

  /**
   * Reports a collision-forced rename according to the configured severity.
   * A rename means two distinct targets resolved to the same name; each keeps
   * its own component (and origin), so report the rename per severity.
   */
  protected reportNameCollision(preferredName: string, componentName: string): void {
    // strategy specific options take precedence over the top-level bundle options
    const onComponentNameCollision =
      this.options.bundle.strategyOpts['arazzo-1']?.onComponentNameCollision ??
      this.options.bundle.onComponentNameCollision;
    if (componentName === preferredName || onComponentNameCollision === 'off') {
      return;
    }

    const message = `Component "${preferredName}" in components/${cf.inputs.name} is referenced with the same name but different content. Renamed to "${componentName}".`;
    if (onComponentNameCollision === 'error') {
      throw new BundleError(message);
    }
    const annotation = new AnnotationElement(message);
    annotation.classes.push('warning');
    annotation.code = 'bundle-component-name-collision';
    // append (never prepend) so the result element stays ahead of annotations
    (this.entryParseResult.content as Element[]).push(annotation);
  }

  /**
   * JSON Schema Objects in Arazzo (used by Input Objects and inline schemas) are
   * a JSON Schema 2020-12 dialect — the only external reference type Arazzo
   * defines. They are bundled per the JSON Schema Compound Document rules: the
   * external schema RESOURCE is embedded verbatim into `components.inputs`
   * (carrying its `$id`), and the referencing `$ref` is left UNCHANGED — it
   * keeps resolving against the embedded resource's `$id`. This mirrors the
   * openapi-3-1 strategy's Schema Object handling.
   */
  public async JSONSchemaElement(path: Path<Element>) {
    const referencingElement = path.node as JSONSchemaElement;

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;

    try {
      // compute baseURI using rules around $self, $id and $ref keywords. The
      // current document's base URI is derived directly (not via toReference)
      // so an internal $ref needs no resolution and never trips the
      // resolve.maxDepth guard.
      const $refBaseURI = resolveSchema$refField(this.baseURI, referencingElement)!;
      const $refBaseURIStrippedHash = url.stripHash($refBaseURI);
      const file = new File({ uri: $refBaseURIStrippedHash });
      const isUnknownURI = none((r: Resolver) => r.canRead(file), this.options.resolve.resolvers);
      const isURL = !isUnknownURI;
      const isInternalReference = this.baseURI === $refBaseURIStrippedHash;
      const isExternalReference = !isInternalReference;

      // internal Schema Object $refs resolve against the in-document $id graph;
      // leaving them untouched keeps that resolution valid. A JSON Schema $ref is
      // never normalized to a bare fragment.
      if (isInternalReference) {
        return;
      }

      // honor the resolve.external switch
      if (!this.options.resolve.external && isExternalReference) {
        return;
      }

      // detect maximum depth of bundling before fetching the external resource
      if (this.reference.depth >= this.options.bundle.maxDepth) {
        throw new MaximumBundleDepthError(
          `Maximum bundle depth of "${this.options.bundle.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.bundle.maxDepth, uri: this.reference.uri },
        );
      }

      // locate the external schema resource the $ref targets, reusing the
      // dereference strategy's classification. First try to resolve the target
      // as a canonical URI / URL against the current document's $id graph; if
      // that fails, fall back to fetching the external document and resolving
      // the fragment there as a $anchor or JSON Pointer.
      let schemaReference = this.reference;
      try {
        const referenceAsSchema = maybeRefractToJSONSchemaElement(
          (schemaReference.value as ParseResultElement).result as Element,
        );
        uriEvaluate($refBaseURI, referenceAsSchema);
      } catch (error) {
        if (isURL && error instanceof EvaluationJsonSchemaUriError) {
          if (isAnchor(uriToAnchor($refBaseURI))) {
            schemaReference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = uriToAnchor($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (schemaReference.value as ParseResultElement).result as Element,
            );
            $anchorEvaluate(selector, referenceAsSchema);
          } else {
            schemaReference = await this.toReference(url.unsanitize($refBaseURI));
            const selector = URIFragmentIdentifier.fromURIReference($refBaseURI);
            const referenceAsSchema = maybeRefractToJSONSchemaElement(
              (schemaReference.value as ParseResultElement).result as Element,
            );
            jsonPointerEvaluate(referenceAsSchema, selector);
          }
        } else {
          throw error;
        }
      }

      // a $ref that resolves (by $id/$anchor/pointer) within the current document
      // is internal even when its URI form (e.g. a URN or absolute $id) is not a
      // bare fragment. Leave it untouched — it resolves against the in-document
      // $id graph, and embedding the current document into itself would be wrong.
      // The same holds for a $ref resolving into the entry document (e.g. by its
      // `$self` identity) — it's already part of the bundle.
      const schemaReferenceURI = url.stripHash(schemaReference.uri);
      const entryDocumentURI = url.stripHash(this.reference.refSet!.rootRef!.uri);
      if (
        schemaReferenceURI === url.stripHash(this.reference.uri) ||
        schemaReferenceURI === entryDocumentURI
      ) {
        return;
      }

      // the resource to embed is the WHOLE external document (its root schema),
      // identified by its $id. A $ref into a fragment of the document embeds the
      // entire document resource once; the fragment keeps resolving against the
      // embedded $id.
      const resourceRoot = maybeRefractToJSONSchemaElement(
        (schemaReference.value as ParseResultElement).result as Element,
      ) as JSONSchemaElement;
      const resourceBaseURI =
        resolveSchema$idField(url.stripHash(schemaReference.uri), resourceRoot) ??
        url.stripHash(schemaReference.uri);

      const field = cf.inputs.name;
      const canonicalKey = `${field}\t${resourceBaseURI}`;

      // resource already embedded (or being embedded) — leave the referencing
      // $ref untouched and stop. This also terminates circular external schema
      // references, since the assignment is reserved BEFORE recursion.
      if (this.assignments.has(canonicalKey)) {
        path.skip();
        return;
      }

      // own a copy of the resource and ensure it carries a $id so the unchanged
      // $ref still resolves against it once embedded
      const embeddedElement = cloneDeep(resourceRoot);
      if (!isStringElement(embeddedElement.$id)) {
        embeddedElement.set('$id', resourceBaseURI);
      }

      // the embedded thing is the WHOLE resource (keyed by its $id), so its name
      // is derived from the resource URI
      const preferredName = this.baseName(embeddedElement, resourceBaseURI);
      const componentName = this.uniqueName(preferredName);

      this.reportNameCollision(preferredName, componentName);

      // reserve the assignment and component name before recursing so circular
      // external schema references terminate
      this.assignments.set(canonicalKey, `#/components/${field}/${escape(componentName)}`);
      if (!this.reservedNames.has(field)) this.reservedNames.set(field, new Set<string>());
      this.reservedNames.get(field)!.add(componentName);

      // bundle external references contained within the embedded resource;
      // nested external resources land flat in the same components.inputs
      const visitor = new Arazzo1BundleVisitor({
        reference: schemaReference,
        options: this.options,
        assignments: this.assignments,
        reservedNames: this.reservedNames,
      });
      const bundledElement = (await traverseAsync(embeddedElement, visitor, {
        mutable: true,
      })) as JSONSchemaElement;

      // annotate the embedded resource with info about its origin
      if (isElement(bundledElement)) {
        bundledElement.meta.set('ref-origin', schemaReference.uri);
      }

      // place the embedded resource into the entry document's components.inputs
      this.ensureInputsField().set(componentName, bundledElement);

      // the referencing $ref is left UNCHANGED — it resolves against the
      // embedded resource's $id
      path.skip();
    } catch (error: unknown) {
      this.handleError(
        `Error while bundling JSON Schema Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
      path.skip();
    }
  }
}

export default Arazzo1BundleVisitor;
