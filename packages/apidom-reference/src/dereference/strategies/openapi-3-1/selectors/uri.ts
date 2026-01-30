import { isUndefined } from 'ramda-adjunct';
import { Element } from '@speclynx/apidom-datamodel';
import { filter } from '@speclynx/apidom-traverse';
import { isJSONSchemaElement, JSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';
import {
  URIFragmentIdentifier,
  evaluate as jsonPointerEvaluate,
} from '@speclynx/apidom-json-pointer';

import * as url from '../../../../util/url.ts';
import EvaluationJsonSchemaUriError from '../../../../errors/EvaluationJsonSchemaUriError.ts';
import { isAnchor, uriToAnchor, evaluate as $anchorEvaluate } from './$anchor.ts';
import { resolveSchema$idField } from '../util.ts';

/**
 * Evaluates JSON Schema $ref containing unknown URI against ApiDOM fragment.
 * @public
 */
export const evaluate = <T extends Element>(uri: string, element: T): Element | undefined => {
  const { cache } = evaluate;
  const uriStrippedHash = url.stripHash(uri);
  const isJSONSchemaElementWith$id = (e: any) =>
    isJSONSchemaElement(e) && typeof e.$id !== 'undefined';

  // warm the cache
  if (!cache.has(element)) {
    const schemaObjectElements = filter(element, isJSONSchemaElementWith$id);
    cache.set(element, Array.from(schemaObjectElements));
  }

  // search for the matching schema
  const result = cache.get(element).find((e: JSONSchemaElement) => {
    const $idBaseURI = resolveSchema$idField(uriStrippedHash, e);
    return $idBaseURI === uriStrippedHash;
  });

  if (isUndefined(result)) {
    throw new EvaluationJsonSchemaUriError(`Evaluation failed on URI: "${uri}"`);
  }

  if (isAnchor(uriToAnchor(uri))) {
    // we're dealing with JSON Schema $anchor here
    return $anchorEvaluate(uriToAnchor(uri), result);
  }

  return jsonPointerEvaluate(result, URIFragmentIdentifier.fromURIReference(uri));
};
evaluate.cache = new WeakMap();

export { EvaluationJsonSchemaUriError };
export { default as JsonSchemaUriError } from '../../../../errors/JsonSchemaUriError.ts';
