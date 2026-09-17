import { trimCharsStart, isUndefined } from 'ramda-adjunct';
import { Element } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { find } from '@speclynx/apidom-traverse';
import { isJSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';

import { getHash } from '../../../../util/url.ts';
import { collectSchema$ids, type SchemaLocation } from '../util.ts';
import EvaluationJsonSchema$anchorError from '../../../../errors/EvaluationJsonSchema$anchorError.ts';
import InvalidJsonSchema$anchorError from '../../../../errors/InvalidJsonSchema$anchorError.ts';

/**
 * @public
 */
export const isAnchor = (uri: string) => {
  /**
   *  MUST start with a letter ([A-Za-z]) or underscore ("_"), followed by any number of letters,
   *  digits ([0-9]), hyphens ("-"), underscores ("_"), and periods (".").
   *
   *  https://json-schema.org/draft/2020-12/json-schema-core.html#rfc.section.8.2.2
   */
  return /^[A-Za-z_][A-Za-z_0-9.-]*$/.test(uri);
};

/**
 * @public
 */
export const uriToAnchor = (uri: string): string => {
  const hash = getHash(uri);
  return trimCharsStart('#', hash);
};

/**
 * @public
 */
export const parse = (anchor: string): string => {
  if (!isAnchor(anchor)) {
    throw new InvalidJsonSchema$anchorError(anchor);
  }

  return anchor;
};

/**
 * Locates the schema identified by JSON Schema $anchor within ApiDOM fragment,
 * along with the `$id`s of the schemas enclosing it (`element` included).
 * @public
 */
export const locate = <T extends Element>(anchor: string, element: T): SchemaLocation => {
  const token = parse(anchor);

  const resultPath = find(
    element,
    // @ts-ignore
    (path) => isJSONSchemaElement(path.node) && toValue(path.node.$anchor) === token,
  );

  if (isUndefined(resultPath)) {
    throw new EvaluationJsonSchema$anchorError(`Evaluation failed on token: "${token}"`);
  }

  return { element: resultPath.node, ancestorSchema$ids: collectSchema$ids(resultPath.parentPath) };
};

/**
 * Evaluates JSON Schema $anchor against ApiDOM fragment.
 * @public
 */
export const evaluate = <T extends Element>(anchor: string, element: T): Element | undefined =>
  locate(anchor, element).element;

export { EvaluationJsonSchema$anchorError, InvalidJsonSchema$anchorError };
export { default as JsonSchema$anchorError } from '../../../../errors/JsonSchema$anchorError.ts';
