import {
  isStringElement,
  Element,
  BooleanElement,
  ParseResultElement,
  cloneDeep,
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
  ReferenceElement,
  ChannelItemElement,
  isChannelItemElement,
  isReferenceElement,
  isSchemaElement,
  isBooleanJSONSchemaElement,
  refract,
  refractReference,
} from '@speclynx/apidom-ns-asyncapi-2';

import DereferenceVisitor from '../DereferenceVisitor.ts';
import * as url from '../../../util/url.ts';
import Reference from '../../../Reference.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface AsyncAPI2DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * Dereferences an AsyncAPI 2 document. Reference Objects expect the type of their
 * `referenced-element` meta, Channel Item `$ref`s a Channel Item Object.
 *
 * @public
 */
class AsyncAPI2DereferenceVisitor extends DereferenceVisitor<undefined> {
  protected get strategyName(): string {
    return 'asyncapi-2';
  }

  protected createVisitor(reference: Reference): AsyncAPI2DereferenceVisitor {
    return new AsyncAPI2DereferenceVisitor({ reference, options: this.options });
  }

  /**
   * A Reference Object stands for the type its reference expects: it's dereferenced as that type.
   */
  protected isOfType(element: Element, type: string): boolean {
    if (isReferenceElement(element)) return true;
    return type === 'schema'
      ? isSchemaElement(element) || isBooleanJSONSchemaElement(element)
      : element.element === type;
  }

  /**
   * A generic structure holding a `$ref` is a Reference Object to the expected type,
   * unless the type has its own `$ref` field (Channel Item Object).
   */
  protected refractTo(element: Element, type: string): Element {
    if (type !== 'channelItem' && isReferenceLikeElement(element)) {
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

      // a reference without an expected type reads its target as its own type
      const type =
        (toValue(referencingElement.meta.get('referenced-element')) as string | undefined) ??
        referencedElement.element;
      await this.addTransclusion(
        path,
        { source: referencedElement, type, reference, context: undefined },
        {
          toTranscludedElement: (element, target) => {
            // a chain of Reference Objects leading back to itself never reaches a value
            if (isReferenceElement(target)) return element;

            // Boolean JSON Schemas
            if (isBooleanJSONSchemaElement(target)) {
              const booleanJsonSchemaElement = cloneDeep<BooleanElement>(target);
              // annotate referenced element with info about original referencing element
              booleanJsonSchemaElement.meta.set('ref-fields', { $ref });
              // annotate referenced element with info about origin
              booleanJsonSchemaElement.meta.set('ref-origin', reference.uri);
              booleanJsonSchemaElement.meta.set('ref-type', element.element);
              return booleanJsonSchemaElement;
            }

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

  public async ChannelItemElement(path: Path<Element>) {
    const referencingElement = path.node as ChannelItemElement;

    if (this.isTranscluded(referencingElement)) {
      path.skip();
      return;
    }

    // ignore ChannelItemElement without $ref field
    if (!isStringElement(referencingElement.$ref)) {
      return;
    }

    const $ref = toValue(referencingElement.$ref) as string;
    const retrievalURI = this.toBaseURI($ref);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Channel Item Objects
    if (!this.options.resolve.internal && isInternalReference) {
      // skip traversing this Channel Item element but traverse all it's child elements
      return;
    }
    // ignore resolving external Channel Item Objects
    if (!this.options.resolve.external && isExternalReference) {
      // skip traversing this Channel Item element but traverse all it's child elements
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
        throw new ApiDOMStructuredError('Recursive Channel Item Object reference detected', {
          $ref,
        });
      }

      await this.addTransclusion(
        path,
        {
          source: referencedElement,
          type: 'channelItem',
          reference,
          context: undefined,
        },
        {
          toTranscludedElement: (element, target) => {
            if (!isChannelItemElement(target)) return target;

            /**
             * Creating a new version of Channel Item by merging fields from referenced Channel Item with referencing one.
             */
            const mergedElement = cloneShallow<ChannelItemElement>(target);
            // existing keywords from referencing ChannelItemElement overrides ones from referenced element
            (element as ChannelItemElement).forEach(
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
        `Error while dereferencing Channel Item Object. Cannot resolve $ref "${$ref}": ${(error as Error).message}`,
        error as Error,
        referencingElement,
        '$ref',
        $ref,
        path,
      );
    }
  }
}

export default AsyncAPI2DereferenceVisitor;
