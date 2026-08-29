import { Element, ParseResultElement, isPrimitiveElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractJSONSchema, isArazzoSpecification1Element } from '@speclynx/apidom-ns-arazzo-1';

import * as url from '../../../util/url.ts';
import type Reference from '../../../Reference.ts';
import type ReferenceSet from '../../../ReferenceSet.ts';

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
 * Finds an already registered Reference by the identity (`$self`) of the Arazzo
 * document it holds, rather than by its retrieval URI. Implements identity-based
 * referencing from Arazzo 1.1.0: a URI matching a loaded document's `$self`
 * refers to that document, regardless of where it was retrieved from.
 *
 * @public
 */
export const findReferenceBy$self = (refSet: ReferenceSet, uri: string): Reference | undefined =>
  refSet.refs.find((ref) => {
    const result = (ref.value as ParseResultElement | undefined)?.result;
    return (
      isArazzoSpecification1Element(result) && resolveArazzo$selfField(ref.uri, result) === uri
    );
  });

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
