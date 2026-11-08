import {
  isStringElement,
  Element,
  ParseResultElement,
  cloneShallow,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import type { Path } from '@speclynx/apidom-traverse';
import {
  evaluate as jsonPointerEvaluate,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  isReferenceLikeElement,
  isJSONReferenceLikeElement,
  ReferenceElement,
  JSONReferenceElement,
  PathItemElement,
  isPathItemElement,
  isReferenceElement,
  isJSONReferenceElement,
  refract,
  refractReference,
  refractJSONReference,
} from '@speclynx/apidom-ns-openapi-2';

import DereferenceVisitor from '../DereferenceVisitor.ts';
import * as url from '../../../util/url.ts';
import Reference from '../../../Reference.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface OpenAPI2DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * Dereferences an OpenAPI 2.0 document. Reference Objects and JSON Reference Objects expect
 * the type of their `referenced-element` meta, Path Item `$ref`s a Path Item Object.
 *
 * @public
 */
class OpenAPI2DereferenceVisitor extends DereferenceVisitor<undefined> {
  protected get strategyName(): string {
    return 'openapi-2';
  }

  protected createVisitor(reference: Reference): OpenAPI2DereferenceVisitor {
    return new OpenAPI2DereferenceVisitor({ reference, options: this.options });
  }

  /**
   * A (JSON) Reference Object stands for the type its reference expects: it's dereferenced as that type.
   */
  protected isOfType(element: Element, type: string): boolean {
    return (
      isReferenceElement(element) || isJSONReferenceElement(element) || element.element === type
    );
  }

  /**
   * A generic structure holding a `$ref` is a reference to the expected type: a JSON Reference
   * Object for a Schema Object, a Reference Object otherwise, unless the type has its own `$ref`
   * field (Path Item Object).
   */
  protected refractTo(element: Element, type: string): Element {
    if (type === 'schema' && isJSONReferenceLikeElement(element)) {
      const referenceElement = refractJSONReference(element);
      referenceElement.meta.set('referenced-element', type);
      return referenceElement;
    }
    if (type !== 'schema' && type !== 'pathItem' && isReferenceLikeElement(element)) {
      const referenceElement = refractReference(element);
      referenceElement.meta.set('referenced-element', type);
      return referenceElement;
    }
    return refract(element, { element: type });
  }

  public async ReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as ReferenceElement;

    // the fields of a Reference Object hold no references
    path.skip();

    // ignore Reference Object without a string $ref, e.g. an empty YAML value
    if (this.isTranscluded(referencingElement) || !isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Reference Objects
    if (!this.options.resolve.internal && isInternalReference) {
      return;
    }
    // ignore resolving external Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);

    try {
      const reference = await this.toReference($ref);
      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
      // possibly non-semantic fragment
      const referencedElement = jsonPointerEvaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Reference Object detected', { $ref });
      }

      const type = referencingElement.meta.get('referenced-element') as string;
      await this.addTransclusion(
        path,
        { source: referencedElement, type, reference, context: undefined },
        {
          toTranscludedElement: (element, target) => {
            // a chain of Reference Objects leading back to itself never reaches a value
            if (isReferenceElement(target)) return element;

            /**
             * Creating a new version of referenced element to avoid modifying the original one.
             */
            const mergedElement = cloneShallow(target);
            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate fragment with info about origin
            mergedElement.meta.set('ref-origin', reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          circular: { uri: $refBaseURI, meta: { uri: reference.uri, $ref }, details: { $ref } },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Reference Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }

  public async PathItemElement(path: Path<Element>) {
    const referencingElement = path.node as PathItemElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // ignore PathItemElement without $ref field
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
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

    const $refBaseURI = url.resolve(retrievalURI, $ref);

    try {
      const reference = await this.toReference($ref);
      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
      // possibly non-semantic referenced element
      const referencedElement = jsonPointerEvaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive Path Item Object reference detected', {
          $ref,
        });
      }

      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type: 'pathItem',
          reference,
          context: undefined,
        },
        {
          toTranscludedElement: (element, target) => {
            if (!isPathItemElement(target)) return target;

            /**
             * Creating a new version of Path Item by merging fields from referenced Path Item with referencing one.
             */
            const mergedElement = cloneShallow<PathItemElement>(target);
            // existing keywords from referencing PathItemElement overrides ones from referenced element
            (element as PathItemElement).forEach(
              (value: Element, keyElement: Element, item: Element) => {
                mergedElement.remove(toValue(keyElement) as string);
                (mergedElement.content as Element[]).push(item);
              },
            );
            mergedElement.remove('$ref');

            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate referenced element with info about origin and type
            mergedElement.meta.set('ref-origin', reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          aliasField: '$ref',
          circular: { uri: $refBaseURI, meta: { uri: reference.uri, $ref }, details: { $ref } },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing Path Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }

  public async JSONReferenceElement(path: Path<Element>) {
    const referencingElement = path.node as JSONReferenceElement;

    // the fields of a JSON Reference Object hold no references
    path.skip();

    // ignore JSON Reference Object without a string $ref, e.g. an empty YAML value
    if (this.isTranscluded(referencingElement) || !isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal JSON Reference Objects
    if (!this.options.resolve.internal && isInternalReference) {
      return;
    }
    // ignore resolving external JSON Reference Objects
    if (!this.options.resolve.external && isExternalReference) {
      return;
    }

    const $refBaseURI = url.resolve(retrievalURI, $ref);

    try {
      const reference = await this.toReference($ref);
      const jsonPointer = URIFragmentIdentifier.fromURIReference($refBaseURI);
      // possibly non-semantic fragment
      const referencedElement = jsonPointerEvaluate<Element>(
        (reference.value as ParseResultElement).result as Element,
        jsonPointer,
      );

      // detect direct reference
      if (referencingElement === referencedElement) {
        throw new ApiDOMStructuredError('Recursive JSON Reference Object detected', { $ref });
      }

      const type = referencingElement.meta.get('referenced-element') as string;
      await this.addTransclusion(
        path,
        { source: referencedElement, type, reference, context: undefined },
        {
          toTranscludedElement: (element, target) => {
            // a chain of JSON Reference Objects leading back to itself never reaches a value
            if (isJSONReferenceElement(target)) return element;

            /**
             * Creating a new version of referenced element to avoid modifying the original one.
             */
            const mergedElement = cloneShallow(target);
            // annotate referenced element with info about original referencing element
            mergedElement.meta.set('ref-fields', { $ref });
            // annotate fragment with info about origin
            mergedElement.meta.set('ref-origin', reference.uri);
            mergedElement.meta.set('ref-type', element.element);

            return mergedElement;
          },
          circular: { uri: $refBaseURI, meta: { uri: reference.uri, $ref }, details: { $ref } },
        },
      );
    } catch (error: unknown) {
      this.handleError(
        `Error while dereferencing JSON Reference Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }
}

export default OpenAPI2DereferenceVisitor;
