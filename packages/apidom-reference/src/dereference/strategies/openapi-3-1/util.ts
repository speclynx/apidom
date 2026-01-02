import { reduce } from 'ramda';
import { Element, isPrimitiveElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { SchemaElement, refractSchema } from '@speclynx/apidom-ns-openapi-3-1';

import * as url from '../../../util/url.ts';

/**
 * @public
 */
export const resolveSchema$refField = (retrievalURI: string, schemaElement: SchemaElement) => {
  if (typeof schemaElement.$ref === 'undefined') {
    return undefined;
  }

  const hash = url.getHash(toValue(schemaElement.$ref) as string);
  const ancestorsSchemaIdentifiers = toValue(
    schemaElement.meta.get('ancestorsSchemaIdentifiers'),
  ) as string[];
  const $refBaseURI = reduce(
    (acc: string, uri: string): string => {
      return url.resolve(acc, url.sanitize(url.stripHash(uri)));
    },
    retrievalURI,
    [...ancestorsSchemaIdentifiers, toValue(schemaElement.$ref) as string],
  );

  return `${$refBaseURI}${hash === '#' ? '' : hash}`;
};

/**
 * @public
 */
export const resolveSchema$idField = (
  retrievalURI: string,
  schemaElement: SchemaElement,
): string | undefined => {
  if (typeof schemaElement.$id === 'undefined') {
    return undefined;
  }

  const ancestorsSchemaIdentifiers = toValue(
    schemaElement.meta.get('ancestorsSchemaIdentifiers'),
  ) as string[];

  return reduce(
    (acc: string, $id: string): string => {
      return url.resolve(acc, url.sanitize(url.stripHash($id)));
    },
    retrievalURI,
    ancestorsSchemaIdentifiers,
  );
};

/**
 * Cached version of SchemaElement.refract.
 */
export const refractToSchemaElement = <T extends Element>(element: T) => {
  if (refractToSchemaElement.cache.has(element)) {
    return refractToSchemaElement.cache.get(element);
  }

  const refracted = refractSchema(element);
  refractToSchemaElement.cache.set(element, refracted);
  return refracted;
};
refractToSchemaElement.cache = new WeakMap();

/**
 * @public
 */
export const maybeRefractToSchemaElement = <T extends Element>(element: T) => {
  /**
   * Conditional version of refractToSchemaElement, that acts as an identity
   * function for all non-primitive Element instances.
   */
  if (isPrimitiveElement(element)) {
    return refractToSchemaElement(element);
  }

  return element;
};
