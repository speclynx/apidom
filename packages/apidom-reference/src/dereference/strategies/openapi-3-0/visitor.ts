import { propEq } from 'ramda';
import { isUndefined } from 'ramda-adjunct';
import {
  isStringElement,
  isElement,
  Element,
  RefElement,
  ParseResultElement,
  cloneShallow,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue, toYAML } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { traverse, traverseAsync, Path, find } from '@speclynx/apidom-traverse';
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

import UnresolvableReferenceError from '../../../errors/UnresolvableReferenceError.ts';
import MaximumDereferenceDepthError from '../../../errors/MaximumDereferenceDepthError.ts';
import MaximumResolveDepthError from '../../../errors/MaximumResolveDepthError.ts';
import * as url from '../../../util/url.ts';
import parse from '../../../parse/index.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import { AncestorLineage } from '../../util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface OpenAPI3_0DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
  readonly indirections?: Element[];
  readonly refractCache?: WeakMap<Element, Element>;
  readonly ancestors?: AncestorLineage<Element>;
}

/**
 * @public
 */
class OpenAPI3_0DereferenceVisitor {
  protected readonly indirections: Element[];

  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  protected readonly refractCache: WeakMap<Element, Element>;

  /**
   * Tracks element ancestors across dive-deep traversal boundaries.
   * Used for cycle detection: if a referenced element is found in
   * the ancestor lineage, a circular reference is detected.
   */
  protected readonly ancestors: AncestorLineage<Element>;

  constructor({
    reference,
    options,
    indirections = [],
    ancestors = new AncestorLineage(),
    refractCache = new WeakMap(),
  }: OpenAPI3_0DereferenceVisitorOptions) {
    this.indirections = indirections;
    this.reference = reference;
    this.options = options;
    this.ancestors = new AncestorLineage(...ancestors);
    this.refractCache = refractCache;
  }

  protected toAncestorLineage(path: Path<Element>): [AncestorLineage<Element>, Set<Element>] {
    const ancestorNodes = path.getAncestorNodes();
    const directAncestors = new Set<Element>(ancestorNodes.filter(isElement));
    const ancestorsLineage = new AncestorLineage(...this.ancestors, directAncestors);

    return [ancestorsLineage, directAncestors];
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

    // register new mutable reference with a refSet
    //
    // NOTE(known limitation): the mutable reference is mutated in place during traversal
    // (via `{ mutable: true }`). When an external document evaluates a JSON pointer back
    // into this document, it may receive an already-resolved element instead of the original
    // $ref. That resolved element was produced using the entry document's resolution context
    // (ancestors, indirections), which may differ from the external document's context.
    // This can affect cycle detection in rare cross-document circular reference patterns.
    //
    // Remediation: evaluate JSON pointers against the immutable (original) parse tree
    // instead of the mutable working copy. The `immutable://` reference below preserves
    // the original tree and could be used for pointer evaluation, ensuring every resolution
    // context always sees raw, unresolved elements and processes them with its own
    // ancestors/indirections. The trade-off is that elements referenced by multiple
    // documents would be resolved once per context instead of being reused.
    const mutableReference = new Reference({
      uri: baseURI,
      value: this.options.dereference.immutable ? cloneDeep(parseResult) : parseResult,
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

    // find element location: tree search for entry documents, visitor path for external
    let location: string | undefined;
    traverse((this.reference.value as ParseResultElement).result as Element, {
      enter: (p: Path<Element>) => {
        if (p.node === referencingElement || this.refractCache.get(p.node) === referencingElement) {
          location = p.formatPath();
          p.stop();
        }
      },
    });
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

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;

    // skip current referencing element as it's already been access
    if (this.indirections.includes(referencingElement)) {
      path.skip();
      return;
    }

    const retrievalURI = this.toBaseURI(toValue(referencingElement.$ref) as string);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Reference Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this reference element and all it's child elements
      path.skip();
      return;
    }
    // ignore resolving external Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this reference element and all it's child elements
      path.skip();
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, toValue(referencingElement.$ref) as string);

    const indirectionsSize = this.indirections.length;
    try {
      const reference = await this.toReference(toValue(referencingElement.$ref) as string);

      this.indirections.push(referencingElement);

      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);

      // possibly non-semantic fragment
      let referencedElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // applying semantics to a fragment
      const referencedElementType = referencingElement.meta.get('referenced-element') as string;
      if (
        referencedElement.element !== referencedElementType &&
        !isReferenceElement(referencedElement)
      ) {
        if (this.refractCache.has(referencedElement)) {
          referencedElement = this.refractCache.get(referencedElement)!;
        } else if (isReferenceLikeElement(referencedElement)) {
          // handling generic indirect references
          const sourceElement = referencedElement;
          referencedElement = refractReference(referencedElement);
          referencedElement.meta.set('referenced-element', referencedElementType);
          this.refractCache.set(sourceElement, referencedElement);
        } else {
          // handling direct references
          const sourceElement = referencedElement;
          referencedElement = refract(referencedElement, { element: referencedElementType });
          this.refractCache.set(sourceElement, referencedElement);
        }
      }

      // detect direct or indirect reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Reference Object detected', {
          $ref: toValue(referencingElement.$ref),
        });
      }

      // detect maximum depth of dereferencing
      if (this.indirections.length > this.options.dereference.maxDepth) {
        throw new MaximumDereferenceDepthError(
          `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.dereference.maxDepth, uri: this.reference.uri },
        );
      }

      // detect second deep dive into the same fragment and avoid it
      const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);
      if (ancestorsLineage.includes(referencedElement)) {
        reference.refSet!.circular = true;

        if (this.options.dereference.circular === 'error') {
          throw new ApiDOMStructuredError('Circular reference detected', {
            $ref: toValue(referencingElement.$ref),
          });
        } else if (this.options.dereference.circular === 'replace') {
          const refElement = new RefElement($refBaseURI, {
            type: referencingElement.element,
            uri: reference.uri,
            $ref: toValue(referencingElement.$ref),
          });
          const replacer =
            this.options.dereference.strategyOpts['openapi-3-0']?.circularReplacer ??
            this.options.dereference.circularReplacer;
          const replacement = replacer(refElement);

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
          indirections: [...this.indirections],
          options: this.options,
          refractCache: this.refractCache,
          ancestors: ancestorsLineage,
        });
        referencedElement = await traverseAsync(referencedElement, visitor, { mutable: true });

        // remove referencing reference from ancestors lineage
        directAncestors.delete(referencingElement);
      }

      /**
       * Creating a new version of referenced element to avoid modifying the original one.
       */
      const mergedElement = cloneShallow(referencedElement);
      // annotate referenced element with info about original referencing element
      mergedElement.meta.set('ref-fields', {
        $ref: toValue(referencingElement.$ref),
      });
      // annotate fragment with info about origin
      mergedElement.meta.set('ref-origin', reference.uri);
      mergedElement.meta.set('ref-type', referencingElement.element);

      /**
       * Transclude referencing element with merged referenced element.
       */
      path.replaceWith(mergedElement);
    } catch (error: unknown) {
      const $ref = toValue(referencingElement.$ref) as string;
      this.handleError(
        `Error while dereferencing Reference Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    } finally {
      if (this.indirections.length > indirectionsSize) this.indirections.pop();
    }
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

    const $refBaseURI = url.resolve(retrievalURI, toValue(referencingElement.$ref) as string);

    const indirectionsSize = this.indirections.length;
    try {
      const reference = await this.toReference(toValue(referencingElement.$ref) as string);

      this.indirections.push(referencingElement);

      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);

      // possibly non-semantic referenced element
      let referencedElement = evaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // applying semantics to a referenced element
      if (!isPathItemElement(referencedElement)) {
        if (this.refractCache.has(referencedElement)) {
          referencedElement = this.refractCache.get(referencedElement)!;
        } else {
          const sourceElement = referencedElement;
          referencedElement = refractPathItem(referencedElement);
          this.refractCache.set(sourceElement, referencedElement);
        }
      }

      // detect direct or indirect reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Path Item Object reference detected', {
          $ref: toValue(referencingElement.$ref),
        });
      }

      // detect maximum depth of dereferencing
      if (this.indirections.length > this.options.dereference.maxDepth) {
        throw new MaximumDereferenceDepthError(
          `Maximum dereference depth of "${this.options.dereference.maxDepth}" has been exceeded in file "${this.reference.uri}"`,
          { maxDepth: this.options.dereference.maxDepth, uri: this.reference.uri },
        );
      }

      // detect cross-boundary cycle
      const [ancestorsLineage, directAncestors] = this.toAncestorLineage(path);
      if (ancestorsLineage.includes(referencedElement)) {
        reference.refSet!.circular = true;

        if (this.options.dereference.circular === 'error') {
          throw new ApiDOMStructuredError('Circular reference detected', {
            $ref: toValue(referencingElement.$ref),
          });
        } else if (this.options.dereference.circular === 'replace') {
          const refElement = new RefElement($refBaseURI, {
            type: referencingElement.element,
            uri: reference.uri,
            $ref: toValue(referencingElement.$ref),
          });
          const replacer =
            this.options.dereference.strategyOpts['openapi-3-0']?.circularReplacer ??
            this.options.dereference.circularReplacer;
          const replacement = replacer(refElement);

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
          indirections: [...this.indirections],
          options: this.options,
          refractCache: this.refractCache,
          ancestors: ancestorsLineage,
        });
        referencedElement = await traverseAsync(referencedElement, visitor, { mutable: true });

        // remove referencing reference from ancestors lineage
        directAncestors.delete(referencingElement);
      }

      /**
       * Creating a new version of Path Item by merging fields from referenced Path Item with referencing one.
       */
      if (isPathItemElement(referencedElement)) {
        const mergedElement = cloneShallow<PathItemElement>(referencedElement);
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
        // annotate referenced element with info about origin and type
        mergedElement.meta.set('ref-origin', reference.uri);
        mergedElement.meta.set('ref-type', referencingElement.element);

        referencedElement = mergedElement;
      }

      /**
       * Transclude referencing element with merged referenced element.
       */
      path.replaceWith(referencedElement);
    } catch (error: unknown) {
      const $ref = toValue(referencingElement.$ref) as string;
      this.handleError(
        `Error while dereferencing Path Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    } finally {
      if (this.indirections.length > indirectionsSize) this.indirections.pop();
    }
  }

  public async LinkElement(path: Path<Element>) {
    const linkElement = path.node as LinkElement;

    // ignore LinkElement without operationRef or operationId field
    if (!isStringElement(linkElement.operationRef) && !isStringElement(linkElement.operationId)) {
      return;
    }

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

    try {
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
        if (!isOperationElement(operationElement)) {
          if (this.refractCache.has(operationElement)) {
            operationElement = this.refractCache.get(operationElement)!;
          } else {
            const sourceElement = operationElement;
            operationElement = refractOperation(operationElement);
            this.refractCache.set(sourceElement, operationElement);
          }
        }
        // create shallow clone to be able to annotate with metadata
        operationElement = cloneShallow(operationElement);
        // annotate operation element with info about origin
        operationElement.meta.set('ref-origin', reference.uri);
        operationElement.meta.set('ref-type', linkElement.element);

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
          (reference.value as ParseResultElement).result as Element,
          (e) =>
            isOperationElement(e) && isElement(e.operationId) && e.operationId.equals(operationId),
        );
        // OperationElement not found by its operationId
        if (isUndefined(operationElement)) {
          throw new ApiDOMStructuredError(
            `OperationElement(operationId=${operationId}) not found`,
            { operationId },
          );
        }

        const linkElementCopy = cloneShallow(linkElement);
        linkElementCopy.operationId?.meta.set('operation', operationElement);

        /**
         * Transclude Link Object containing Operation Object in its meta.
         */
        path.replaceWith(linkElementCopy);
      }
    } catch (error: unknown) {
      const refFieldName = isStringElement(linkElement.operationRef)
        ? 'operationRef'
        : 'operationId';
      const refFieldValue = isStringElement(linkElement.operationRef)
        ? (toValue(linkElement.operationRef) as string)
        : (toValue(linkElement.operationId) as string);
      this.handleError(
        `Error while dereferencing Link Object. Cannot resolve ${refFieldName} "${refFieldValue}": ${(error as Error).message}`,
        error as Error,
        linkElement,
        refFieldName,
        refFieldValue,
        path,
      );
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
      throw new ApiDOMStructuredError(
        'ExampleElement value and externalValue fields are mutually exclusive',
        {
          value: toValue(exampleElement.value),
          externalValue: toValue(exampleElement.externalValue),
        },
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

    try {
      const reference = await this.toReference(toValue(exampleElement.externalValue) as string);

      // shallow clone of the referenced element
      const valueElement = cloneShallow((reference.value as ParseResultElement).result as Element);
      // annotate operation element with info about origin
      valueElement.meta.set('ref-origin', reference.uri);
      valueElement.meta.set('ref-type', exampleElement.element);

      const exampleElementCopy = cloneShallow(exampleElement);
      exampleElementCopy.value = valueElement;

      /**
       * Transclude Example Object containing external value.
       */
      path.replaceWith(exampleElementCopy);
    } catch (error: unknown) {
      const externalValue = toValue(exampleElement.externalValue) as string;
      this.handleError(
        `Error while dereferencing Example Object. Cannot resolve externalValue "${externalValue}": ${(error as Error).message}`,
        error as Error,
        exampleElement,
        'externalValue',
        externalValue,
        path,
      );
    }
  }
}

export default OpenAPI3_0DereferenceVisitor;
