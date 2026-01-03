import { propEq } from 'ramda';
import { isUndefined } from 'ramda-adjunct';
import {
  isPrimitiveElement,
  isStringElement,
  isElement,
  Element,
  RefElement,
  Namespace,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { IdentityManager, find, toValue } from '@speclynx/apidom-core';
import { ApiDOMError } from '@speclynx/apidom-error';
import { traverseAsync, Path } from '@speclynx/apidom-traverse';
import { evaluate, URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';
import {
  ReferenceElement,
  ExampleElement,
  LinkElement,
  PathItemElement,
  isReferenceElement,
  isOperationElement,
  isPathItemElement,
  isReferenceLikeElement,
  refract,
  refractReference,
  refractPathItem,
  refractOperation,
} from '@speclynx/apidom-ns-openapi-3-0';

import MaximumDereferenceDepthError from '../../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import { AncestorLineage } from '../../util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

// initialize element identity manager
const identityManager = new IdentityManager();

/**
 * @public
 */
export interface OpenAPI3_0DereferenceVisitorOptions {
  readonly namespace: Namespace;
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly indirections?: Element[];
  readonly ancestors?: AncestorLineage<Element>;
  readonly refractCache?: Map<string, Element>;
}

/**
 * @public
 */
class OpenAPI3_0DereferenceVisitor {
  protected readonly indirections: Element[];

  protected readonly namespace: Namespace;

  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  protected readonly ancestors: AncestorLineage<Element>;

  protected readonly refractCache: Map<string, Element>;

  constructor({
    reference,
    namespace,
    options,
    indirections = [],
    ancestors = new AncestorLineage(),
    refractCache = new Map(),
  }: OpenAPI3_0DereferenceVisitorOptions) {
    this.indirections = indirections;
    this.namespace = namespace;
    this.reference = reference;
    this.options = options;
    this.ancestors = new AncestorLineage(...ancestors);
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

    // register new mutable reference with a refSet
    const mutableReference = new Reference({
      uri: baseURI,
      value: cloneDeep(parseResult),
      depth: this.reference.depth + 1,
    });
    refSet.add(mutableReference);

    if (this.options.dereference.immutable) {
      // register new immutable reference with a refSet
      const immutableReference = new Reference({
        uri: `immutable://${baseURI}`,
        value: parseResult,
        depth: this.reference.depth + 1,
      });
      refSet.add(immutableReference);
    }

    return mutableReference;
  }

  protected toAncestorLineage(path: Path<Element>): [AncestorLineage<Element>, Set<Element>] {
    /**
     * Compute full ancestors lineage.
     * Ancestors are flatten to unwrap all Element instances.
     */
    const ancestorNodes = path.getAncestorNodes();
    const directAncestors = new Set<Element>(ancestorNodes.filter(isElement));
    const ancestorsLineage = new AncestorLineage(...this.ancestors, directAncestors);

    return [ancestorsLineage, directAncestors];
  }

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;

    // skip current referencing element as it's already been access
    if (this.indirections.includes(referencingElement)) {
      path.skip();
      return;
    }

    const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);

    const retrievalURI = this.toBaseURI(toValue(referencingElement.$ref) as string);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Reference Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this reference element
      path.skip();
      return;
    }
    // ignore resolving external Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this reference element
      path.skip();
      return;
    }

    const reference = await this.toReference(toValue(referencingElement.$ref) as string);
    const $refBaseURI = url.resolve(retrievalURI, toValue(referencingElement.$ref) as string);

    this.indirections.push(referencingElement);

    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);

    // possibly non-semantic fragment
    let referencedElement = evaluate<Element>(
      (reference.value as ParseResultElement).result as Element,
      jsonPointer,
    );
    referencedElement.id = identityManager.identify(referencedElement);

    /**
     * Applying semantics to a referenced element if semantics are missing.
     */
    if (isPrimitiveElement(referencedElement)) {
      const referencedElementType = toValue(
        referencingElement.meta.get('referenced-element'),
      ) as string;
      const cacheKey = `${referencedElementType}-${toValue(identityManager.identify(referencedElement))}`;

      if (this.refractCache.has(cacheKey)) {
        referencedElement = this.refractCache.get(cacheKey)!;
      } else if (isReferenceLikeElement(referencedElement)) {
        // handling indirect references
        referencedElement = refractReference(referencedElement);
        referencedElement.meta.set('referenced-element', referencedElementType);
        this.refractCache.set(cacheKey, referencedElement);
      } else {
        // handling direct references
        referencedElement = refract(referencedElement, { element: referencedElementType });
        this.refractCache.set(cacheKey, referencedElement);
      }
    }

    // detect direct or circular reference
    if (referencingElement === referencedElement) {
      throw new ApiDOMError('Recursive Reference Object detected');
    }

    // detect maximum depth of dereferencing
    if (this.indirections.length > this.options.dereference.maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
      );
    }

    // detect second deep dive into the same fragment and avoid it
    if (ancestorsLineage.includes(referencedElement)) {
      reference.refSet!.circular = true;

      if (this.options.dereference.circular === 'error') {
        throw new ApiDOMError('Circular reference detected');
      } else if (this.options.dereference.circular === 'replace') {
        const refElement = new RefElement(referencedElement.id, {
          type: 'reference',
          uri: reference.uri,
          $ref: toValue(referencingElement.$ref),
        });
        const replacer =
          this.options.dereference.strategyOpts['openapi-3-0']?.circularReplacer ??
          this.options.dereference.circularReplacer;
        const replacement = replacer(refElement);

        this.indirections.pop();
        path.replaceWith(replacement);
        return;
      }
    }

    /**
     * Dive deep into the fragment.
     *
     * Cases to consider:
     *  1. We're crossing document boundary
     *  2. Fragment is from non-entry document
     *  3. Fragment is a Reference Object. We need to follow it to get the eventual value
     *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
     */
    const isNonEntryDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
    const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
    if (
      (isExternalReference ||
        isNonEntryDocument ||
        isReferenceElement(referencedElement) ||
        shouldDetectCircular) &&
      !ancestorsLineage.includesCycle(referencedElement)
    ) {
      // append referencing reference to ancestors lineage
      directAncestors.add(referencingElement);

      const visitor = new OpenAPI3_0DereferenceVisitor({
        reference,
        namespace: this.namespace,
        indirections: [...this.indirections],
        options: this.options,
        refractCache: this.refractCache,
        ancestors: ancestorsLineage,
      });
      referencedElement = await traverseAsync(referencedElement, visitor, { mutable: true });

      // remove referencing reference from ancestors lineage
      directAncestors.delete(referencingElement);
    }

    this.indirections.pop();

    /**
     * Creating a new version of referenced element to avoid modifying the original one.
     */
    const mergedElement = cloneShallow(referencedElement);
    // assign unique id to merged element
    mergedElement.meta.set('id', identityManager.generateId());
    // annotate referenced element with info about original referencing element
    mergedElement.meta.set('ref-fields', {
      $ref: toValue(referencingElement.$ref),
    });
    // annotate fragment with info about origin
    mergedElement.meta.set('ref-origin', reference.uri);
    // annotate fragment with info about referencing element
    mergedElement.meta.set(
      'ref-referencing-element-id',
      cloneDeep(identityManager.identify(referencingElement)),
    );

    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(mergedElement);
  }

  public async PathItemElement(path: Path<Element>) {
    const referencingElement = path.node as PathItemElement;

    // ignore PathItemElement without $ref field
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    // skip current referencing element as it's already been access
    if (this.indirections.includes(referencingElement)) {
      path.skip();
      return;
    }

    const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);

    const retrievalURI = this.toBaseURI(toValue(referencingElement.$ref) as string);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Path Item Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this Path Item element but traverse all it's child elements
      return;
    }
    // ignore resolving external Path Item Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this Path Item element but traverse all it's child elements
      return;
    }

    const reference = await this.toReference(toValue(referencingElement.$ref) as string);
    const $refBaseURI = url.resolve(retrievalURI, toValue(referencingElement.$ref) as string);

    this.indirections.push(referencingElement);

    const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);

    // possibly non-semantic referenced element
    let referencedElement = evaluate<Element>(
      (reference.value as ParseResultElement).result as Element,
      jsonPointer,
    );
    referencedElement.id = identityManager.identify(referencedElement);

    /**
     * Applying semantics to a referenced element if semantics are missing.
     */
    if (!isPathItemElement(referencedElement)) {
      const cacheKey = `path-item-${toValue(identityManager.identify(referencedElement))}`;

      if (this.refractCache.has(cacheKey)) {
        referencedElement = this.refractCache.get(cacheKey)!;
      } else {
        referencedElement = refractPathItem(referencedElement);
        this.refractCache.set(cacheKey, referencedElement);
      }
    }

    // detect direct or circular reference
    if (referencingElement === referencedElement) {
      throw new ApiDOMError('Recursive Path Item Object reference detected');
    }

    // detect maximum depth of dereferencing
    if (this.indirections.length > this.options.dereference.maxDepth) {
      throw new MaximumDereferenceDepthError(
        `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
      );
    }

    // detect second deep dive into the same fragment and avoid it
    if (ancestorsLineage.includes(referencedElement)) {
      reference.refSet!.circular = true;

      if (this.options.dereference.circular === 'error') {
        throw new ApiDOMError('Circular reference detected');
      } else if (this.options.dereference.circular === 'replace') {
        const refElement = new RefElement(referencedElement.id, {
          type: 'path-item',
          uri: reference.uri,
          $ref: toValue(referencingElement.$ref),
        });
        const replacer =
          this.options.dereference.strategyOpts['openapi-3-0']?.circularReplacer ??
          this.options.dereference.circularReplacer;
        const replacement = replacer(refElement);

        this.indirections.pop();
        path.replaceWith(replacement);
        return;
      }
    }

    /**
     * Dive deep into the fragment.
     *
     * Cases to consider:
     *  1. We're crossing document boundary
     *  2. Fragment is from non-entry document
     *  3. Fragment is a Path Item Object with $ref field. We need to follow it to get the eventual value
     *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
     */
    const isNonEntryDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
    const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
    if (
      (isExternalReference ||
        isNonEntryDocument ||
        (isPathItemElement(referencedElement) && isStringElement(referencedElement.$ref)) ||
        shouldDetectCircular) &&
      !ancestorsLineage.includesCycle(referencedElement)
    ) {
      // append referencing reference to ancestors lineage
      directAncestors.add(referencingElement);

      const visitor = new OpenAPI3_0DereferenceVisitor({
        reference,
        namespace: this.namespace,
        indirections: [...this.indirections],
        options: this.options,
        refractCache: this.refractCache,
        ancestors: ancestorsLineage,
      });
      referencedElement = await traverseAsync(referencedElement, visitor, { mutable: true });

      // remove referencing reference from ancestors lineage
      directAncestors.delete(referencingElement);
    }

    this.indirections.pop();

    /**
     * Creating a new version of Path Item by merging fields from referenced Path Item with referencing one.
     */
    if (isPathItemElement(referencedElement)) {
      const mergedElement = cloneShallow<PathItemElement>(referencedElement);
      // assign unique id to merged element
      mergedElement.meta.set('id', identityManager.generateId());
      // existing keywords from referencing PathItemElement overrides ones from referenced element
      referencingElement.forEach((value: Element, keyElement: Element, item: Element) => {
        mergedElement.remove(toValue(keyElement) as string);
        (mergedElement.content as Element[]).push(item);
      });
      mergedElement.remove('$ref');

      // annotate referenced element with info about original referencing element
      mergedElement.meta.set('ref-fields', {
        $ref: toValue(referencingElement.$ref),
      });
      // annotate referenced element with info about origin
      mergedElement.meta.set('ref-origin', reference.uri);
      // annotate fragment with info about referencing element
      mergedElement.meta.set(
        'ref-referencing-element-id',
        cloneDeep(identityManager.identify(referencingElement)),
      );

      referencedElement = mergedElement;
    }

    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(referencedElement);
  }

  public async LinkElement(path: Path<Element>) {
    const linkElement = path.node as LinkElement;

    // ignore LinkElement without operationRef or operationId field
    if (!isStringElement(linkElement.operationRef) && !isStringElement(linkElement.operationId)) {
      return;
    }

    // operationRef and operationId fields are mutually exclusive
    if (isStringElement(linkElement.operationRef) && isStringElement(linkElement.operationId)) {
      throw new ApiDOMError(
        'LinkElement operationRef and operationId fields are mutually exclusive.',
      );
    }

    let operationElement: Element | undefined;

    if (isStringElement(linkElement.operationRef)) {
      // possibly non-semantic referenced element
      const jsonPointer = URIFragmentIdentifier.fromURIReference(
        toValue(linkElement.operationRef) as string,
      );
      const retrievalURI = this.toBaseURI(toValue(linkElement.operationRef) as string);
      const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
      const isExternalReference = !isInternalReference;

      // ignore resolving internal Operation Object reference
      if (!this.options.resolve.internal && isInternalReference) {
        // skip traversing this Link element but traverse all it's child elements
        return;
      }
      // ignore resolving external Operation Object reference
      if (!this.options.resolve.external && isExternalReference) {
        // skip traversing this Link element but traverse all it's child elements
        return;
      }

      const reference = await this.toReference(toValue(linkElement.operationRef) as string);

      operationElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );
      // applying semantics to a referenced element
      if (isPrimitiveElement(operationElement)) {
        const cacheKey = `operation-${toValue(identityManager.identify(operationElement))}`;

        if (this.refractCache.has(cacheKey)) {
          operationElement = this.refractCache.get(cacheKey)!;
        } else {
          operationElement = refractOperation(operationElement);
          this.refractCache.set(cacheKey, operationElement);
        }
      }
      // create shallow clone to be able to annotate with metadata
      operationElement = cloneShallow(operationElement);
      // annotate operation element with info about origin
      operationElement.meta.set('ref-origin', reference.uri);

      const linkElementCopy = cloneShallow(linkElement);
      linkElementCopy.operationRef?.meta.set('operation', operationElement);

      /**
       * Transclude Link Object containing Operation Object in its meta.
       */
      path.replaceWith(linkElementCopy);
      return;
    }

    if (isStringElement(linkElement.operationId)) {
      const operationId = toValue(linkElement.operationId) as string;
      const reference = await this.toReference(url.unsanitize(this.reference.uri));
      operationElement = find(
        (e) =>
          isOperationElement(e) && isElement(e.operationId) && e.operationId.equals(operationId),
        (reference.value as ParseResultElement).result as Element,
      );
      // OperationElement not found by its operationId
      if (isUndefined(operationElement)) {
        throw new ApiDOMError(`OperationElement(operationId=${operationId}) not found.`);
      }

      const linkElementCopy = cloneShallow(linkElement);
      linkElementCopy.operationId?.meta.set('operation', operationElement);

      /**
       * Transclude Link Object containing Operation Object in its meta.
       */
      path.replaceWith(linkElementCopy);
      return;
    }
  }

  public async ExampleElement(path: Path<Element>) {
    const exampleElement = path.node as ExampleElement;

    // ignore ExampleElement without externalValue field
    if (!isStringElement(exampleElement.externalValue)) {
      return;
    }

    // value and externalValue fields are mutually exclusive
    if (exampleElement.hasKey('value') && isStringElement(exampleElement.externalValue)) {
      throw new ApiDOMError(
        'ExampleElement value and externalValue fields are mutually exclusive.',
      );
    }

    const retrievalURI = this.toBaseURI(toValue(exampleElement.externalValue) as string);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving external Example Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this Example element but traverse all it's child elements
      return;
    }
    // ignore resolving external Example Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this Example element but traverse all it's child elements
      return;
    }

    const reference = await this.toReference(toValue(exampleElement.externalValue) as string);

    // shallow clone of the referenced element
    const valueElement = cloneShallow((reference.value as ParseResultElement).result as Element);
    // annotate operation element with info about origin
    valueElement.meta.set('ref-origin', reference.uri);

    const exampleElementCopy = cloneShallow(exampleElement);
    exampleElementCopy.value = valueElement;

    /**
     * Transclude Example Object containing external value.
     */
    path.replaceWith(exampleElementCopy);
  }
}

export default OpenAPI3_0DereferenceVisitor;
