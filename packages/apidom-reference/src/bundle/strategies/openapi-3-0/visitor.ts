import { propEq, equals } from 'ramda';
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
import { toValue } from '@speclynx/apidom-core';
import { traverseAsync, type Path } from '@speclynx/apidom-traverse';
import { evaluate, escape, unescape, URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';
import {
  ReferenceElement,
  PathItemElement,
  ExampleElement,
  LinkElement,
  ComponentsElement,
  isReferenceElement,
  isReferenceLikeElement,
  isPathItemElement,
  refract,
  refractReference,
  refractPathItem,
} from '@speclynx/apidom-ns-openapi-3-0';

import BundleError from '../../../errors/BundleError.ts';
import MaximumBundleDepthError from '../../../errors/MaximumBundleDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * Maps the `referenced-element` meta value (set during refraction) to the
 * Components Object field where the referenced element should be hoisted.
 */
const componentFieldByReferencedElement: Record<string, string> = {
  schema: 'schemas',
  response: 'responses',
  parameter: 'parameters',
  example: 'examples',
  requestBody: 'requestBodies',
  header: 'headers',
  securityScheme: 'securitySchemes',
  link: 'links',
  callback: 'callbacks',
};

/**
 * A previously hoisted external fragment, keyed by its canonical
 * `baseURI#jsonPointer`. `pointer` is the internal JSON pointer that
 * referencing elements are rewritten to point at.
 */
interface Assignment {
  readonly field: string;
  readonly name: string;
  readonly pointer: string;
}

/**
 * A component already hoisted into the entry document, retaining the value of
 * the fragment as it was before bundling. Used to collapse multiple references
 * whose targets are deeply equal into a single component.
 */
interface HoistedComponent {
  readonly name: string;
  readonly pointer: string;
  readonly value: unknown;
}

/**
 * @public
 */
/**
 * Context passed to a custom component-name resolver.
 *
 * @public
 */
export interface ComponentNameResolverArgs {
  /** The refracted element being hoisted. */
  readonly element: Element;
  /** The Components Object field the element is hoisted into (e.g. `schemas`). */
  readonly field: string;
  /** The JSON Pointer of the referenced fragment within its document. */
  readonly jsonPointer: string;
  /** The base URI (without hash) of the referenced document. */
  readonly baseURI: string;
}

/**
 * @public
 */
export type ComponentNameResolver = (args: ComponentNameResolverArgs) => string;

/**
 * @public
 */
export type ComponentNamesStrategy = 'basename' | 'title' | ComponentNameResolver;

/**
 * @public
 */
export type ComponentNameCollisionSeverity = 'off' | 'warn' | 'error';

/**
 * @public
 */
export interface OpenAPI3_0BundleVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly entryURI: string;
  readonly entryResult: Element;
  readonly componentNamesStrategy?: ComponentNamesStrategy;
  readonly onComponentNameCollision?: ComponentNameCollisionSeverity;
  readonly assignments?: Map<string, Assignment>;
  readonly hoisted?: Map<string, HoistedComponent[]>;
  readonly annotations?: AnnotationElement[];
  readonly refractCache?: WeakMap<Element, Element>;
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
   */
  protected readonly entryURI: string;

  /**
   * The root element of the entry document. Hoisted external fragments are
   * placed into its `components` object.
   */
  protected readonly entryResult: Element;

  /**
   * Determines how hoisted components are named (`basename` or `title`).
   */
  protected readonly componentNamesStrategy: ComponentNamesStrategy;

  /**
   * Determines how a collision-forced rename is reported (`off`/`warn`/`error`).
   */
  protected readonly onComponentNameCollision: ComponentNameCollisionSeverity;

  /**
   * Shared across the entry document and every external document visitor.
   * Guarantees each external fragment is hoisted exactly once and gives us a
   * stable internal pointer to rewrite every referencing element to.
   */
  protected readonly assignments: Map<string, Assignment>;

  /**
   * Components already hoisted into the entry document, grouped by Components
   * Object field. Lets references with deeply equal targets collapse into a
   * single component instead of producing `Pet`, `Pet-2`, `Pet-3`, ...
   */
  protected readonly hoisted: Map<string, HoistedComponent[]>;

  /**
   * Shared sink for diagnostics surfaced during bundling (e.g. a component
   * rename forced by a name collision). Appended to the returned parse result
   * as warning annotations.
   */
  protected readonly annotations: AnnotationElement[];

  protected readonly refractCache: WeakMap<Element, Element>;

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
    entryURI,
    entryResult,
    componentNamesStrategy = 'basename',
    onComponentNameCollision = 'warn',
    assignments = new Map<string, Assignment>(),
    hoisted = new Map<string, HoistedComponent[]>(),
    annotations = [],
    refractCache = new WeakMap(),
    inlineStack = new Set<string>(),
  }: OpenAPI3_0BundleVisitorOptions) {
    this.reference = reference;
    this.options = options;
    this.componentNamesStrategy = componentNamesStrategy;
    this.onComponentNameCollision = onComponentNameCollision;
    this.entryURI = entryURI;
    this.entryResult = entryResult;
    this.inlineStack = inlineStack;
    this.assignments = assignments;
    this.hoisted = hoisted;
    this.annotations = annotations;
    this.refractCache = refractCache;
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
   * Lazily creates the Components Object (and the requested field within it)
   * on the entry document, returning the field where a fragment is hoisted.
   */
  protected ensureComponentsField(field: string): ObjectElement {
    const entryResult = this.entryResult as ObjectElement;
    let components = entryResult.get('components') as ComponentsElement | undefined;
    if (!isObjectElement(components)) {
      components = new ComponentsElement();
      entryResult.set('components', components);
    }

    let fieldElement = components.get(field) as ObjectElement | undefined;
    if (!isObjectElement(fieldElement)) {
      fieldElement = new ObjectElement();
      components.set(field, fieldElement);
    }

    return fieldElement;
  }

  /**
   * Derives a component name from the referenced JSON Pointer's last token,
   * falling back to the referenced file's basename.
   */
  protected basenameOf(jsonPointer: string, baseURI: string): string {
    const tokens = jsonPointer.split('/').filter((token) => token !== '');
    let candidate = tokens.length > 0 ? unescape(tokens[tokens.length - 1]) : '';
    if (candidate === '') {
      candidate = url.getExtension(baseURI)
        ? baseURI.slice(baseURI.lastIndexOf('/') + 1, baseURI.lastIndexOf('.'))
        : baseURI.slice(baseURI.lastIndexOf('/') + 1);
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
    if (typeof this.componentNamesStrategy === 'function') {
      const resolved = this.componentNamesStrategy({ element, field, jsonPointer, baseURI });
      if (typeof resolved === 'string' && resolved !== '') {
        return resolved;
      }
      return this.basenameOf(jsonPointer, baseURI);
    }

    if (this.componentNamesStrategy === 'title') {
      const title = toValue((element as ObjectElement).get?.('title'));
      if (typeof title === 'string' && title.trim() !== '') {
        // PascalCase the title, replace characters invalid in a component name
        // with `-`, then collapse and trim stray separators
        const pascal = title
          .trim()
          .split(/\s+/)
          .map((word) => word.replace(/^[a-z]/, (char) => char.toUpperCase()))
          .join('')
          .replace(/[^a-zA-Z0-9.\-_]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        if (pascal !== '') return pascal;
      }
      // fall back to basename when no usable title is present
    }

    return this.basenameOf(jsonPointer, baseURI);
  }

  /**
   * Computes a collision-free component name within the target field by
   * suffixing `-2`, `-3`, ... on top of the strategy-derived base name.
   */
  protected uniqueName(
    element: Element,
    field: string,
    jsonPointer: string,
    baseURI: string,
  ): string {
    const candidate = this.baseName(element, field, jsonPointer, baseURI);

    // a name is taken if it's already placed in components or reserved by a
    // component that is still being bundled (reserved before recursion)
    const fieldElement = this.ensureComponentsField(field);
    const reserved = this.hoisted.get(field) ?? [];
    const isTaken = (taken: string): boolean =>
      fieldElement.hasKey(taken) || reserved.some((component) => component.name === taken);

    if (!isTaken(candidate)) {
      return candidate;
    }

    let counter = 2;
    while (isTaken(`${candidate}-${counter}`)) {
      counter += 1;
    }
    return `${candidate}-${counter}`;
  }

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;
    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    if (isInternalReference) {
      // a bare fragment is already self-contained; leave it untouched
      if ($ref.startsWith('#')) {
        path.skip();
        return;
      }

      // a self-file reference (e.g. "./root.json#/...") resolves to this
      // document but carries a file path that makes the bundled document
      // non-transferable. Normalize it to a bare fragment.
      referencingElement.set('$ref', url.getHash($ref));
      path.skip();
      return;
    }

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      path.skip();
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, toValue(referencingElement.$ref) as string);
    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
    const canonicalKey = `${retrievalURI}#${jsonPointer}`;

    // already hoisted (or being hoisted) — just rewrite the pointer
    if (this.assignments.has(canonicalKey)) {
      referencingElement.set('$ref', this.assignments.get(canonicalKey)!.pointer);
      path.skip();
      return;
    }

    const reference = await this.toReference(toValue(referencingElement.$ref) as string);

    // possibly non-semantic fragment
    let referencedElement = evaluate<Element>(
      (reference.value as ParseResultElement).result as Element,
      jsonPointer,
    );

    // apply semantics to the fragment so nested references become Reference Objects
    const referencedElementType = referencingElement.meta.get('referenced-element') as string;
    if (
      referencedElement.element !== referencedElementType &&
      !isReferenceElement(referencedElement)
    ) {
      if (this.refractCache.has(referencedElement)) {
        referencedElement = this.refractCache.get(referencedElement)!;
      } else if (isReferenceLikeElement(referencedElement)) {
        const sourceElement = referencedElement;
        referencedElement = refractReference(referencedElement);
        referencedElement.meta.set('referenced-element', referencedElementType);
        this.refractCache.set(sourceElement, referencedElement);
      } else {
        const sourceElement = referencedElement;
        referencedElement = refract(referencedElement, { element: referencedElementType });
        this.refractCache.set(sourceElement, referencedElement);
      }
    }

    const field =
      componentFieldByReferencedElement[referencedElementType] ??
      componentFieldByReferencedElement.schema;

    // collapse references whose targets are deeply equal into one component.
    // the pre-bundle value is compared: bundling rewrites refs deterministically,
    // so targets equal before bundling remain equal after.
    const referencedValue = toValue(referencedElement);
    const existing = (this.hoisted.get(field) ?? []).find((component) =>
      equals(component.value, referencedValue),
    );
    if (existing !== undefined) {
      this.assignments.set(canonicalKey, {
        field,
        name: existing.name,
        pointer: existing.pointer,
      });
      referencingElement.set('$ref', existing.pointer);
      path.skip();
      return;
    }

    const preferredName = this.baseName(referencedElement, field, jsonPointer, retrievalURI);
    const name = this.uniqueName(referencedElement, field, jsonPointer, retrievalURI);
    const internalPointer = `#/components/${field}/${escape(name)}`;

    // a rename here means a different-content target wanted an already-taken
    // name (deeply equal targets were collapsed earlier). Report per severity.
    if (name !== preferredName && this.onComponentNameCollision !== 'off') {
      const message = `Component "${preferredName}" in components/${field} is referenced with the same name but different content. Renamed to "${name}".`;
      if (this.onComponentNameCollision === 'error') {
        throw new BundleError(message);
      }
      const annotation = new AnnotationElement(message);
      annotation.classes.push('warning');
      annotation.code = 'bundle-component-name-collision';
      this.annotations.push(annotation);
    }

    // reserve the assignment and component slot before recursing so cyclic
    // references terminate
    this.assignments.set(canonicalKey, { field, name, pointer: internalPointer });
    if (!this.hoisted.has(field)) this.hoisted.set(field, []);
    this.hoisted.get(field)!.push({ name, pointer: internalPointer, value: referencedValue });

    // detect maximum depth of bundling
    if (this.assignments.size > this.options.bundle.maxDepth) {
      throw new MaximumBundleDepthError(
        `Maximum bundle depth of "${this.options.bundle.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
        { maxDepth: this.options.bundle.maxDepth, uri: this.reference.uri },
      );
    }

    // own a copy of the fragment and bundle its own external references
    const hoistedElement = cloneDeep(referencedElement);
    const childVisitor = new OpenAPI3_0BundleVisitor({
      reference,
      options: this.options,
      entryURI: this.entryURI,
      entryResult: this.entryResult,
      componentNamesStrategy: this.componentNamesStrategy,
      onComponentNameCollision: this.onComponentNameCollision,
      assignments: this.assignments,
      hoisted: this.hoisted,
      annotations: this.annotations,
      refractCache: this.refractCache,
      inlineStack: this.inlineStack,
    });
    const bundledElement = await traverseAsync(hoistedElement, childVisitor, { mutable: true });

    // annotate the hoisted fragment with info about its origin
    if (isElement(bundledElement)) {
      bundledElement.meta.set('ref-origin', reference.uri);
    }

    // place the bundled fragment into the entry document's components
    this.ensureComponentsField(field).set(name, bundledElement);

    // rewrite the referencing element to point at the hoisted fragment
    referencingElement.set('$ref', internalPointer);
    path.skip();
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
      // normalize self-file references to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      if (!$ref.startsWith('#')) {
        pathItemElement.set('$ref', url.getHash($ref));
      }
      return;
    }

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, toValue(pathItemElement.$ref) as string);
    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
    const canonicalKey = `${retrievalURI}#${jsonPointer}`;

    // a circular external Path Item reference cannot be inlined without
    // recursing forever; leave the $ref in place to break the cycle
    if (this.inlineStack.has(canonicalKey)) {
      return;
    }

    const reference = await this.toReference(toValue(pathItemElement.$ref) as string);

    let referencedElement = evaluate<Element>(
      (reference.value as ParseResultElement).result as Element,
      jsonPointer,
    );

    // apply Path Item semantics to the referenced fragment
    if (!isPathItemElement(referencedElement)) {
      if (this.refractCache.has(referencedElement)) {
        referencedElement = this.refractCache.get(referencedElement)!;
      } else {
        const sourceElement = referencedElement;
        referencedElement = refractPathItem(referencedElement);
        this.refractCache.set(sourceElement, referencedElement);
      }
    }

    // own a copy and bundle the external references it contains
    const inlinedElement = cloneDeep(referencedElement) as PathItemElement;
    this.inlineStack.add(canonicalKey);
    const childVisitor = new OpenAPI3_0BundleVisitor({
      reference,
      options: this.options,
      entryURI: this.entryURI,
      entryResult: this.entryResult,
      componentNamesStrategy: this.componentNamesStrategy,
      onComponentNameCollision: this.onComponentNameCollision,
      assignments: this.assignments,
      hoisted: this.hoisted,
      annotations: this.annotations,
      refractCache: this.refractCache,
      inlineStack: this.inlineStack,
    });
    const bundledElement = (await traverseAsync(inlinedElement, childVisitor, {
      mutable: true,
    })) as PathItemElement;
    this.inlineStack.delete(canonicalKey);

    // merge sibling fields from the referencing Path Item over the referenced one
    pathItemElement.forEach((_value: Element, keyElement: Element, item: Element) => {
      bundledElement.remove(toValue(keyElement) as string);
      (bundledElement.content as Element[]).push(item);
    });
    bundledElement.remove('$ref');
    bundledElement.meta.set('ref-origin', reference.uri);

    path.replaceWith(bundledElement);
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

    const retrievalURI = this.toBaseURI(toValue(exampleElement.externalValue) as string);
    const isInternalReference = this.entryURI === retrievalURI;
    const isExternalReference = !isInternalReference;

    // honor the resolve.external switch
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const reference = await this.toReference(toValue(exampleElement.externalValue) as string);
    const valueElement = cloneShallow((reference.value as ParseResultElement).result as Element);
    valueElement.meta.set('ref-origin', reference.uri);

    const exampleElementCopy = cloneShallow(exampleElement);
    exampleElementCopy.value = valueElement;
    exampleElementCopy.remove('externalValue');

    path.replaceWith(exampleElementCopy);
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

    // only external operationRef links need adjusting
    if (!isStringElement(linkElement.operationRef)) {
      return;
    }

    const operationRef = toValue(linkElement.operationRef) as string;
    const retrievalURI = this.toBaseURI(operationRef);
    const isInternalReference = this.entryURI === retrievalURI;

    if (isInternalReference) {
      // normalize self-file operationRef to a bare fragment so the bundled
      // document stays transferable; bare fragments are left untouched
      if (!operationRef.startsWith('#')) {
        linkElement.set('operationRef', url.getHash(operationRef));
      }
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
