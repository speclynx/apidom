import { propOr, omit } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';
import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import { parse as parseJSON, detect as detectJSON } from '@speclynx/apidom-parser-adapter-json';
import asyncApiNamespacePlugin, { refractAsyncApi2 } from '@speclynx/apidom-ns-asyncapi-2';

export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const detectionRegExp =
  /"asyncapi"\s*:\s*"(?<version_json>2\.(?:[1-9]\d*|0)\.(?:[1-9]\d*|0))"/;

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> =>
  detectionRegExp.test(source) && (await detectJSON(source));

/**
 * @public
 */
export const parse = async (
  source: string,
  options: Record<string, unknown> = {},
): Promise<ParseResultElement> => {
  const refractorOpts: Record<string, unknown> = propOr({}, 'refractorOpts', options);
  const parserOpts = omit(['refractorOpts'], options);
  const parseResultElement = await parseJSON(source, parserOpts);
  const { result } = parseResultElement;

  if (isNotUndefined(result)) {
    const asyncApiElement = refractAsyncApi2(result, refractorOpts);
    asyncApiElement.classes.push('result');
    parseResultElement.replaceResult(asyncApiElement);
  }

  return parseResultElement;
};

/**
 * @public
 */
export const namespace = new Namespace().use(asyncApiNamespacePlugin);
