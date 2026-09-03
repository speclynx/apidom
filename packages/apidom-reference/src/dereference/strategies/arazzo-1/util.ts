import {
  Element,
  ParseResultElement,
  AnnotationElement,
  isPrimitiveElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import {
  refractJSONSchema,
  isArazzoSpecification1Element,
  SourceDescriptionElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { isSwaggerElement } from '@speclynx/apidom-ns-openapi-2';
import { isOpenApi3_0Element } from '@speclynx/apidom-ns-openapi-3-0';
import { isOpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

import * as url from '../../../util/url.ts';
import type Reference from '../../../Reference.ts';

export { resolveSchema$refField, resolveSchema$idField } from '../openapi-3-1/util.ts';

/**
 * Computes the base URI of an Arazzo document per Arazzo 1.1.0 rules.
 *
 * When the Arazzo Object carries a `$self` field, it establishes the document's
 * canonical identity and the base URI for resolving relative references. `$self`
 * may itself be relative, in which case it's resolved against the retrieval URI.
 * Any fragment is stripped, as `$self` MUST NOT contain one. When `$self` is
 * absent (or `element` is not an Arazzo document), the retrieval URI is the base URI.
 *
 * @public
 */
export const resolveArazzo$selfField = (retrievalURI: string, element: unknown): string => {
  if (!isArazzoSpecification1Element(element)) {
    return retrievalURI;
  }

  const $self = toValue(element.$self);
  if (typeof $self !== 'string' || $self === '') {
    return retrievalURI;
  }

  return url.resolve(retrievalURI, url.sanitize(url.stripHash($self)));
};

/**
 * URIs an Arazzo document is known by: its retrieval URI and, when the
 * document carries a `$self` field resolving elsewhere, its identity.
 */
export const arazzoDocumentURIs = (retrievalURI: string, element: unknown): string[] => {
  const identity = resolveArazzo$selfField(retrievalURI, element);
  return identity === retrievalURI ? [retrievalURI] : [retrievalURI, identity];
};

/**
 * Annotates a source description result when the document is not an OpenAPI
 * or Arazzo document, or does not match the type the source description declares.
 */
export const validateSourceDescriptionAPI = (
  parseResult: ParseResultElement,
  sourceDescription: SourceDescriptionElement,
  sourceDescriptionAPI: Element | undefined,
  retrievalURI: string,
  verb: 'parsed' | 'dereferenced',
): void => {
  // only allow OpenAPI and Arazzo as source descriptions
  const isOpenApi =
    isSwaggerElement(sourceDescriptionAPI) ||
    isOpenApi3_0Element(sourceDescriptionAPI) ||
    isOpenApi3_1Element(sourceDescriptionAPI);
  const isArazzo = isArazzoSpecification1Element(sourceDescriptionAPI);

  if (!isOpenApi && !isArazzo) {
    const annotation = new AnnotationElement(
      `Source description "${retrievalURI}" is not an OpenAPI or Arazzo document`,
    );
    annotation.classes.push('warning');
    parseResult.push(annotation);
    return;
  }

  // validate declared type matches actual type
  const declaredType = toValue(sourceDescription.type);
  if (typeof declaredType === 'string') {
    if (declaredType === 'openapi' && !isOpenApi) {
      const annotation = new AnnotationElement(
        `Source description "${retrievalURI}" declared as "openapi" but ${verb} as Arazzo document`,
      );
      annotation.classes.push('warning');
      parseResult.push(annotation);
    } else if (declaredType === 'arazzo' && !isArazzo) {
      const annotation = new AnnotationElement(
        `Source description "${retrievalURI}" declared as "arazzo" but ${verb} as OpenAPI document`,
      );
      annotation.classes.push('warning');
      parseResult.push(annotation);
    }
  }
};

/**
 * Predicate matching a Reference by the identity (`$self`) of the Arazzo
 * document it holds, rather than by its retrieval URI. Implements identity-based
 * referencing from Arazzo 1.1.0: a URI matching a loaded document's `$self`
 * refers to that document, regardless of where it was retrieved from.
 *
 * @public
 */
export const identifiedBy$self =
  (uri: string) =>
  (reference: Reference): boolean => {
    const result = (reference.value as ParseResultElement | undefined)?.result;
    return (
      isArazzoSpecification1Element(result) &&
      resolveArazzo$selfField(reference.uri, result) === uri
    );
  };

/**
 * Cached version of JSONSchemaElement.refract.
 */
export const refractToJSONSchemaElement = <T extends Element>(element: T) => {
  if (refractToJSONSchemaElement.cache.has(element)) {
    return refractToJSONSchemaElement.cache.get(element);
  }

  const refracted = refractJSONSchema(element);
  refractToJSONSchemaElement.cache.set(element, refracted);
  return refracted;
};
refractToJSONSchemaElement.cache = new WeakMap();

/**
 * @public
 */
export const maybeRefractToJSONSchemaElement = <T extends Element>(element: T) => {
  /**
   * Conditional version of refractToJSONSchemaElement, that acts as an identity
   * function for all non-primitive Element instances.
   */
  if (isPrimitiveElement(element)) {
    return refractToJSONSchemaElement(element);
  }

  return element;
};
