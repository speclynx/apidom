import { isUndefined } from 'ramda-adjunct';
import {
  isElement,
  isStringElement,
  Element,
  ParseResultElement,
  cloneShallow,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { find, type Path } from '@speclynx/apidom-traverse';
import {
  evaluate as jsonPointerEvaluate,
  URIFragmentIdentifier,
} from '@speclynx/apidom-json-pointer';
import {
  isReferenceLikeElement,
  ReferenceElement,
  PathItemElement,
  LinkElement,
  ExampleElement,
  isPathItemElement,
  isReferenceElement,
  isOperationElement,
  refract,
  refractReference,
} from '@speclynx/apidom-ns-openapi-3-0';

import DereferenceVisitor from '../DereferenceVisitor.ts';
import * as url from '../../../util/url.ts';
import Reference from '../../../Reference.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export interface OpenAPI3_0DereferenceVisitorOptions {
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * Dereferences an OpenAPI 3.0 document. Reference Objects expect the type of their
 * `referenced-element` meta, Path Item `$ref`s a Path Item Object. Link Objects get the
 * Operation Object they point at attached, Example Objects the external value.
 *
 * @public
 */
class OpenAPI3_0DereferenceVisitor extends DereferenceVisitor<undefined> {
  protected get strategyName(): string {
    return 'openapi-3-0';
  }

  protected createVisitor(reference: Reference): OpenAPI3_0DereferenceVisitor {
    return new OpenAPI3_0DereferenceVisitor({ reference, options: this.options });
  }

  /**
   * A Reference Object stands for the type its reference expects: it's dereferenced as that type.
   */
  protected isOfType(element: Element, type: string): boolean {
    return isReferenceElement(element) || element.element === type;
  }

  /**
   * A generic structure holding a `$ref` is a Reference Object to the expected type,
   * unless the type has its own `$ref` field (Path Item Object).
   */
  protected refractTo(element: Element, type: string): Element {
    if (type !== 'pathItem' && isReferenceLikeElement(element)) {
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

  public async LinkElement(path: Path<Element>) {
    const linkElement = path.node as LinkElement;

    if (this.isTranscluded(linkElement)) {
      path.skip();
      return;
    }

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
      if (isStringElement(linkElement.operationRef)) {
        const operationRef = toValue(linkElement.operationRef) as string;
        // possibly non-semantic referenced element
        const jsonPointer = URIFragmentIdentifier.fromURIReference(operationRef);
        const retrievalURI = this.toBaseURI(operationRef);
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

        const reference = await this.toReference(operationRef);
        const operationElement = jsonPointerEvaluate<Element>(
          (reference.value as ParseResultElement).result as Element,
          jsonPointer,
        );

        await this.addAttachment(
          path,
          {
            source: operationElement,
            type: 'operation',
            reference,
            context: undefined,
          },
          (element, target) => {
            // create shallow clone to be able to annotate with metadata
            const operationCopy = cloneShallow(target);
            // annotate operation element with info about origin and type
            operationCopy.meta.set('ref-origin', reference.uri);
            operationCopy.meta.set('ref-type', element.element);

            /**
             * Transclude Link Object containing Operation Object in its meta.
             */
            const linkElementCopy = cloneShallow(element as LinkElement);
            linkElementCopy.operationRef?.meta.set('operation', operationCopy);
            return linkElementCopy;
          },
        );
        return;
      }

      const operationId = toValue(linkElement.operationId) as string;
      const reference = await this.toReference(url.unsanitize(this.reference.uri));
      const operationPath = find(
        (reference.value as ParseResultElement).result as Element,
        (p) =>
          isOperationElement(p.node) &&
          isElement(p.node.operationId) &&
          p.node.operationId.equals(operationId),
      );
      const operationElement = operationPath?.node;
      // OperationElement not found by its operationId
      if (isUndefined(operationElement)) {
        throw new ApiDOMStructuredError(`OperationElement(operationId=${operationId}) not found`, {
          operationId,
        });
      }

      await this.addAttachment(
        path,
        {
          source: operationElement,
          type: 'operation',
          reference,
          context: undefined,
        },
        (element, target) => {
          /**
           * Transclude Link Object containing Operation Object in its meta.
           */
          const linkElementCopy = cloneShallow(element as LinkElement);
          linkElementCopy.operationId?.meta.set('operation', target);
          return linkElementCopy;
        },
      );
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

    if (this.isTranscluded(exampleElement)) {
      path.skip();
      return;
    }

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

    const externalValue = toValue(exampleElement.externalValue) as string;
    const retrievalURI = this.toBaseURI(externalValue);
    const isInternalReference = url.stripHash(this.reference.uri) === retrievalURI;
    const isExternalReference = !isInternalReference;

    // ignore resolving internal Example Objects
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
      const reference = await this.toReference(externalValue);
      const valueSource = (reference.value as ParseResultElement).result as Element;

      await this.addAttachment(
        path,
        {
          source: valueSource,
          type: valueSource.element,
          reference,
          context: undefined,
        },
        (element, target) => {
          // shallow clone of the referenced element
          const valueElement = cloneShallow(target);
          // annotate element with info about origin and type
          valueElement.meta.set('ref-origin', reference.uri);
          valueElement.meta.set('ref-type', element.element);

          /**
           * Transclude Example Object containing external value.
           */
          const exampleElementCopy = cloneShallow(element as ExampleElement);
          exampleElementCopy.value = valueElement;
          return exampleElementCopy;
        },
      );
    } catch (error: unknown) {
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
