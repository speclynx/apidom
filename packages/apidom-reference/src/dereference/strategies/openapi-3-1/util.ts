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
 * @public
 */
export const isJSONSchemaElementWith$id = (element: unknown): element is JSONSchemaElement =>
  isJSONSchemaElement(element) && isStringElement(element.$id);

/**
 * `$id`s declared by the JSON Schema elements among `nodes`, in order.
 * @public
 */
export const schema$idsOf = (nodes: readonly unknown[]): string[] =>
  nodes.filter(isJSONSchemaElementWith$id).map((node) => toValue(node.$id) as string);

/**
 * `$id`s of the JSON Schema elements on `path` (outermost first, the node itself
 * included). The `$id`s are read from the elements themselves rather than from
 * refraction-time metadata, so a `$id` assigned after refraction (e.g. by the
 * bundler) is honored.
 * @public
 */
export const collectSchema$ids = (path: Path<Element> | null): string[] => {
  const $ids: string[] = [];

  for (let current = path; current !== null; current = current.parentPath) {
    if (isJSONSchemaElementWith$id(current.node)) {
      $ids.unshift(toValue(current.node.$id) as string);
    }
  }

  return $ids;
};

/**
 * Resolves a chain of `$id`s (outermost first) against `baseURI`, each `$id`
 * refining the base the next one resolves against.
 * @public
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
 *
 * @public
 */
export const resolveSchemaBaseURI = (baseURI: string, path: Path<Element>): string =>
  resolveSchema$ids(baseURI, collectSchema$ids(path));

/**
 * Resolves the `$ref` of the schema at `path` against the schema's base URI,
 * or returns `undefined` when the schema has no `$ref`.
 *
 * @public
 */
export const resolveSchema$refField = (
  baseURI: string,
  path: Path<Element>,
): string | undefined => {
  const $ref = (path.node as JSONSchemaElement).$ref;

  if (typeof $ref === 'undefined') {
    return undefined;
  }

  const $refValue = toValue($ref) as string;
  const hash = url.getHash($refValue);
  const $refBaseURI = resolveSchema$ids(baseURI, [...collectSchema$ids(path), $refValue]);

  return `${$refBaseURI}${hash === '#' ? '' : hash}`;
};

/**
 * Resolves the canonical URI of the schema at `path`, or returns `undefined`
 * when the schema declares no `$id`.
 *
 * @public
 */
export const resolveSchema$idField = (baseURI: string, path: Path<Element>): string | undefined => {
  if (typeof (path.node as JSONSchemaElement).$id === 'undefined') {
    return undefined;
  }

  return resolveSchemaBaseURI(baseURI, path);
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
