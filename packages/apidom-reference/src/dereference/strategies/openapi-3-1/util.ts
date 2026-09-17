import { reduce } from 'ramda';
import { Element, isPrimitiveElement, isStringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import type { Path } from '@speclynx/apidom-traverse';
import { isJSONSchemaElement, JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';
import { refractSchema } from '@speclynx/apidom-ns-openapi-3-1';

import * as url from '../../../util/url.ts';

/**
 * A schema located within a document, together with the `$id`s of the JSON Schema
 * elements enclosing it (outermost first; the located schema's own `$id` excluded).
 * @public
 */
export interface SchemaLocation {
  readonly element: Element;
  readonly ancestorSchema$ids: string[];
}

/**
 * Whether the element is a JSON Schema element declaring a `$id`.
 */
export const isJSONSchemaElementWith$id = (element: unknown): element is JSONSchemaElement =>
  isJSONSchemaElement(element) && isStringElement(element.$id);

/**
 * `$id`s declared by the JSON Schema elements among `nodes`, in order.
 */
export const schema$idsOf = (nodes: readonly unknown[]): string[] =>
  nodes.filter(isJSONSchemaElementWith$id).map((node) => toValue(node.$id) as string);

/**
 * `$id`s of the JSON Schema elements on `path` (outermost first, the node itself
 * included). The `$id`s are read from the elements themselves rather than from
 * refraction-time metadata, so a `$id` assigned after refraction (e.g. by the
 * bundler) is honored.
 */
export const collectSchema$ids = (path: Path<Element>): string[] =>
  schema$idsOf([...path.getAncestorNodes().reverse(), path.node]);

/**
 * Resolves a chain of `$id`s (outermost first) against `baseURI`, each `$id`
 * refining the base the next one resolves against.
 */
export const resolveSchema$ids = (baseURI: string, $ids: readonly string[]): string =>
  reduce(
    (acc: string, $id: string): string => url.resolve(acc, url.sanitize(url.stripHash($id))),
    baseURI,
    $ids,
  );

/**
 * Resolves the base URI of the schema at `path`: `baseURI` (the base URI in
 * effect at the traversal root) refined by each `$id` on the schema's ancestor
 * chain in turn, the schema's own `$id` included.
 */
export const resolveSchemaBaseURI = (baseURI: string, path: Path<Element>): string =>
  resolveSchema$ids(baseURI, collectSchema$ids(path));

/**
 * Resolves the `$ref` of the schema against its base URI (see
 * `resolveSchemaBaseURI`), or returns `undefined` when the schema has no string `$ref`.
 *
 * @public
 */
export const resolveSchema$refField = (
  schemaBaseURI: string,
  schemaElement: JSONSchemaElement,
): string | undefined => {
  if (!isStringElement(schemaElement.$ref)) {
    return undefined;
  }

  const $ref = toValue(schemaElement.$ref) as string;
  const hash = url.getHash($ref);
  const $refBaseURI = resolveSchema$ids(schemaBaseURI, [$ref]);

  return `${$refBaseURI}${hash === '#' ? '' : hash}`;
};

/**
 * Resolves the `$id` of the schema against `baseURI`, the base URI in effect
 * where the schema sits, or returns `undefined` when the schema declares no string `$id`.
 *
 * @public
 */
export const resolveSchema$idField = (
  baseURI: string,
  schemaElement: JSONSchemaElement,
): string | undefined => {
  if (!isStringElement(schemaElement.$id)) {
    return undefined;
  }

  return resolveSchema$ids(baseURI, [toValue(schemaElement.$id) as string]);
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
