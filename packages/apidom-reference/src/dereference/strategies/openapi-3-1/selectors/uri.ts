import { isUndefined } from 'ramda-adjunct';
import { Element } from '@speclynx/apidom-datamodel';
import { filter } from '@speclynx/apidom-traverse';
import { JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';
import { URIFragmentIdentifier } from '@speclynx/apidom-json-pointer';

import * as url from '../../../../util/url.ts';
import EvaluationJsonSchemaUriError from '../../../../errors/EvaluationJsonSchemaUriError.ts';
import {
  isJSONSchemaElementWith$id,
  collectSchema$ids,
  resolveSchema$ids,
  type SchemaLocation,
} from '../util.ts';
import { isAnchor, uriToAnchor, locate as $anchorLocate } from './$anchor.ts';
import { locate as jsonPointerLocate } from './json-pointer.ts';

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

const indexSchema$ids = (element: Element) =>
  filter(element, (path) => isJSONSchemaElementWith$id(path.node)).map((path) => ({
    schema: path.node as JSONSchemaElement,
    $ids: collectSchema$ids(path),
  }));

/**
 * Locates the schema addressed by JSON Schema $ref containing unknown URI within
 * ApiDOM fragment, along with the `$id`s of the schemas enclosing it.
 * @public
 */
export const locate = <T extends Element>(
  uri: string,
  element: T,
  options: EvaluateOptions = {},
): SchemaLocation => {
  const uriStrippedHash = url.stripHash(uri);
  const { baseURI = uriStrippedHash, index = new WeakMap() } = options;

  if (!index.has(element)) {
    index.set(element, indexSchema$ids(element));
  }

  // search for the schema whose canonical URI matches
  const entry = index
    .get(element)!
    .find(({ $ids }) => resolveSchema$ids(baseURI, $ids) === uriStrippedHash);

  if (isUndefined(entry)) {
    throw new EvaluationJsonSchemaUriError(`Evaluation failed on URI: "${uri}"`);
  }

  // the fragment is resolved within the matched schema, whose own $id is the
  // last of its chain; the fragment walk contributes it again when descending
  const fragmentLocation = isAnchor(uriToAnchor(uri))
    ? $anchorLocate(uriToAnchor(uri), entry.schema)
    : jsonPointerLocate(entry.schema, URIFragmentIdentifier.fromURIReference(uri));

  return {
    element: fragmentLocation.element,
    ancestorSchema$ids: [...entry.$ids.slice(0, -1), ...fragmentLocation.ancestorSchema$ids],
  };
};

/**
 * Evaluates JSON Schema $ref containing unknown URI against ApiDOM fragment.
 * @public
 */
export const evaluate = <T extends Element>(
  uri: string,
  element: T,
  options: EvaluateOptions = {},
): Element | undefined => locate(uri, element, options).element;

export type { SchemaLocation } from '../util.ts';
export { EvaluationJsonSchemaUriError };
export { default as JsonSchemaUriError } from '../../../../errors/JsonSchemaUriError.ts';
