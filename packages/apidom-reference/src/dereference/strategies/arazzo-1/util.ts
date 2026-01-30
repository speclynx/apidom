import { Element, isPrimitiveElement } from '@speclynx/apidom-datamodel';
import { refractJSONSchema } from '@speclynx/apidom-ns-arazzo-1';

export { resolveSchema$refField, resolveSchema$idField } from '../openapi-3-1/util.ts';

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
