import { omit, propOr } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';
import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import {
  parse as parseYAML,
  detect as detectYAML,
  type ParseDetectOptions,
  type ParseOptions as ParseOptionsYAML,
} from '@speclynx/apidom-parser-adapter-yaml-1-2';
import asyncApiNamespace, { refractAsyncApi2 } from '@speclynx/apidom-ns-asyncapi-2';

export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const detectionRegExp =
  /(?<YAML>^(["']?)asyncapi\2\s*:\s*(["']?)(?<version_yaml>2\.(?:[1-9]\d*|0)\.(?:[1-9]\d*|0))\3(?:\s+|$))|(?<JSON>"asyncapi"\s*:\s*"(?<version_json>2\.(?:[1-9]\d*|0)\.(?:[1-9]\d*|0))")/m;

/**
 * @public
 */
export const detect: typeof detectYAML = async (
  source: string,
  options: ParseDetectOptions = {},
): Promise<boolean> => detectionRegExp.test(source) && (await detectYAML(source, options));

/**
 * @public
 */
export interface ParseOptions extends ParseOptionsYAML {
  refractorOpts?: Record<string, unknown>;
}

/**
 * @public
 */
export const parse: typeof parseYAML = async (
  source: string,
  options: ParseOptions = {},
): Promise<ParseResultElement> => {
  const refractorOpts: Record<string, unknown> = propOr({}, 'refractorOpts', options);
  const parserOpts = omit(['refractorOpts'], options);
  const parseResultElement = await parseYAML(source, parserOpts);
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
export const namespace = new Namespace().use(asyncApiNamespace);
