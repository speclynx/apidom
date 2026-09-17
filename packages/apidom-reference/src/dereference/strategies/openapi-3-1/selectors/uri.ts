import { reduce } from 'ramda';
import { isUndefined } from 'ramda-adjunct';
import { Element, isStringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { filter, type Path } from '@speclynx/apidom-traverse';
import { isJSONSchemaElement, JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';
import {
  URIFragmentIdentifier,
  evaluate as jsonPointerEvaluate,
} from '@speclynx/apidom-json-pointer';

import * as url from '../../../../util/url.ts';
import EvaluationJsonSchemaUriError from '../../../../errors/EvaluationJsonSchemaUriError.ts';
import { isAnchor, uriToAnchor, evaluate as $anchorEvaluate } from './$anchor.ts';

/**
 * Index of `$id`-bearing schemas per document root. Each entry pairs a schema with
 * the `$id`s of its enclosing schema resources (outermost first, including its own).
 * The index is populated once per document and never refreshed, so callers scope it
 * to a single dereference/bundle run instead of sharing it globally. Within a run the
 * `$id` graph of an indexed document is stable: the bundle strategies mutate deep
 * clones and place components only after the entry traversal ends, and the
 * dereference strategies only replace `$ref`-bearing schemas.
 * @public
 */
export type Schema$idIndex = WeakMap<Element, { schema: JSONSchemaElement; $ids: string[] }[]>;

/**
 * @public
 */
export interface EvaluateOptions {
  /**
   * URI the `$id`s of the document resolve against (its retrieval URI or `$self`).
   * Defaults to the evaluated URI itself, which only matches schemas identified by an
   * absolute `$id`; pass the document's base URI to match relative `$id`s correctly.
   */
  readonly baseURI?: string;
  readonly index?: Schema$idIndex;
}

const isJSONSchemaElementWith$id = (element: Element): element is JSONSchemaElement =>
  isJSONSchemaElement(element) && isStringElement(element.$id);

// the $ids are read from the elements themselves rather than from refraction-time
// metadata, so a $id assigned after refraction (e.g. by the bundler) is honored
const collectSchema$ids = (path: Path<Element>): string[] => {
  const $ids: string[] = [];

  for (let current: Path<Element> | null = path; current !== null; current = current.parentPath) {
    if (isJSONSchemaElementWith$id(current.node)) {
      $ids.unshift(toValue(current.node.$id) as string);
    }
  }

  return $ids;
};

const indexSchema$ids = (element: Element) =>
  filter(element, (path) => isJSONSchemaElementWith$id(path.node)).map((path) => ({
    schema: path.node as JSONSchemaElement,
    $ids: collectSchema$ids(path),
  }));

/**
 * Evaluates JSON Schema $ref containing unknown URI against ApiDOM fragment.
 * @public
 */
export const evaluate = <T extends Element>(
  uri: string,
  element: T,
  options: EvaluateOptions = {},
): Element | undefined => {
  const uriStrippedHash = url.stripHash(uri);
  const { baseURI = uriStrippedHash, index = new WeakMap() } = options;

  if (!index.has(element)) {
    index.set(element, indexSchema$ids(element));
  }

  // search for the schema whose canonical URI matches
  const entry = index.get(element)!.find(({ $ids }) => {
    const canonicalURI = reduce(
      (acc: string, $id: string): string => url.resolve(acc, url.sanitize(url.stripHash($id))),
      baseURI,
      $ids,
    );
    return canonicalURI === uriStrippedHash;
  });

  if (isUndefined(entry)) {
    throw new EvaluationJsonSchemaUriError(`Evaluation failed on URI: "${uri}"`);
  }

  if (isAnchor(uriToAnchor(uri))) {
    // we're dealing with JSON Schema $anchor here
    return $anchorEvaluate(uriToAnchor(uri), entry.schema);
  }

  return jsonPointerEvaluate(entry.schema, URIFragmentIdentifier.fromURIReference(uri));
};

export { EvaluationJsonSchemaUriError };
export { default as JsonSchemaUriError } from '../../../../errors/JsonSchemaUriError.ts';
