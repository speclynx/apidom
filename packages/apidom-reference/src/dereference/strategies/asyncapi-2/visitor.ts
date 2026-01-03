import { propEq } from 'ramda';
import {
  isElement,
  isPrimitiveElement,
  isStringElement,
  Namespace,
  Element,
  BooleanElement,
  RefElement,
  ParseResultElement,
  cloneDeep,
  cloneShallow,
} from '@speclynx/apidom-datamodel';
import { IdentityManager, toValue } from '@speclynx/apidom-core';
import { ApiDOMError } from '@speclynx/apidom-error';
import { traverseAsync, Path } from '@speclynx/apidom-traverse';
import { evaluate, URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';
import {
  ChannelItemElement,
  isReferenceLikeElement,
  isBooleanJsonSchemaElement,
  isChannelItemElement,
  isReferenceElement,
  ReferenceElement,
  refract,
  refractReference,
  refractChannelItem,
} from '@speclynx/apidom-ns-asyncapi-2';

import MaximumDereferenceDepthError from '../../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import { AncestorLineage } from '../../util.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

// initialize element identity manager
const identityManager = new IdentityManager();

/**
 * @public
 */
export interface AsyncAPI2DereferenceVisitorOptions {
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
class AsyncAPI2DereferenceVisitor {
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
  }: AsyncAPI2DereferenceVisitorOptions) {
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
      // skip traversing this reference and all it's child elements
      path.skip();
      return;
    }
    // ignore resolving external Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this reference and all it's child elements
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
        referencedElement = refract(referencedElement, {
          element: referencedElementType,
        });
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
          this.options.dereference.strategyOpts['asyncapi-2']?.circularReplacer ??
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
     *  2. Fragment is from non-root document
     *  3. Fragment is a Reference Object. We need to follow it to get the eventual value
     *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
     */
    const isNonRootDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
    const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
    if (
      (isExternalReference ||
        isNonRootDocument ||
        isReferenceElement(referencedElement) ||
        shouldDetectCircular) &&
      !ancestorsLineage.includesCycle(referencedElement)
    ) {
      // append referencing reference to ancestors lineage
      directAncestors.add(referencingElement);

      const visitor = new AsyncAPI2DereferenceVisitor({
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

    // Boolean JSON Schemas
    if (isBooleanJsonSchemaElement(referencedElement as unknown)) {
      const booleanJsonSchemaElement = cloneDeep(referencedElement) as BooleanElement;
      // assign unique id to merged element
      booleanJsonSchemaElement.meta.set('id', identityManager.generateId());
      // annotate referenced element with info about original referencing element
      booleanJsonSchemaElement.meta.set('ref-fields', {
        $ref: toValue(referencingElement.$ref),
      });
      // annotate referenced element with info about origin
      booleanJsonSchemaElement.meta.set('ref-origin', reference.uri);
      // annotate fragment with info about referencing element
      booleanJsonSchemaElement.meta.set(
        'ref-referencing-element-id',
        cloneDeep(identityManager.identify(referencingElement)),
      );

      path.replaceWith(booleanJsonSchemaElement);
      return;
    }

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

  public async ChannelItemElement(path: Path<Element>) {
    const referencingElement = path.node as ChannelItemElement;

    // ignore ChannelItemElement without $ref field
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

    // ignore resolving internal Channel Item Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this channel item but traverse all it's child elements
      return;
    }
    // ignore resolving external Channel Item Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this channel item but traverse all it's child elements
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
    if (isPrimitiveElement(referencedElement)) {
      const cacheKey = `channel-item-${toValue(identityManager.identify(referencedElement))}`;

      if (this.refractCache.has(cacheKey)) {
        referencedElement = this.refractCache.get(cacheKey)!;
      } else {
        referencedElement = refractChannelItem(referencedElement);
        this.refractCache.set(cacheKey, referencedElement);
      }
    }

    // detect direct or indirect reference
    if (referencingElement === referencedElement) {
      throw new ApiDOMError('Recursive Channel Item Object reference detected');
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
          type: 'channel-item',
          uri: reference.uri,
          $ref: toValue(referencingElement.$ref),
        });
        const replacer =
          this.options.dereference.strategyOpts['asyncapi-2']?.circularReplacer ??
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
     *  2. Fragment is from non-root document
     *  3. Fragment is a Channel Item Object with $ref field. We need to follow it to get the eventual value
     *  4. We are dereferencing the fragment lazily/eagerly depending on circular mode
     */
    const isNonRootDocument = url.stripHash(reference.refSet!.rootRef!.uri) !== reference.uri;
    const shouldDetectCircular = ['error', 'replace'].includes(this.options.dereference.circular);
    if (
      (isExternalReference ||
        isNonRootDocument ||
        (isChannelItemElement(referencedElement) && isStringElement(referencedElement.$ref)) ||
        shouldDetectCircular) &&
      !ancestorsLineage.includesCycle(referencedElement)
    ) {
      // append referencing reference to ancestors lineage
      directAncestors.add(referencingElement);

      const visitor = new AsyncAPI2DereferenceVisitor({
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
     * Creating a new version of Channel Item by merging fields from referenced Channel Item with referencing one.
     */
    if (isChannelItemElement(referencedElement)) {
      const mergedElement = cloneShallow<ChannelItemElement>(referencedElement);
      // assign unique id to merged element
      mergedElement.meta.set('id', identityManager.generateId());
      // existing keywords from referencing ChannelItemElement overrides ones from referenced ChannelItemElement
      referencingElement.forEach((value: Element, keyElement: Element, item: Element) => {
        mergedElement.remove(toValue(keyElement) as string);
        (mergedElement.content as Element[]).push(item);
      });
      mergedElement.remove('$ref');

      // annotate referenced element with info about original referencing element
      mergedElement.meta.set('ref-fields', {
        $ref: toValue(referencingElement.$ref),
      });
      // annotate referenced with info about origin
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

  // Index signature for Visitor compatibility
  [key: string]: unknown;
}

export default AsyncAPI2DereferenceVisitor;
