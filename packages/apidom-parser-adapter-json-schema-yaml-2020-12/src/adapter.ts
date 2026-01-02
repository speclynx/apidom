import { propOr, omit } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';
import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import { parse as parseYAML, detect as detectYAML } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import jsonSchemaNamespace, { refractJSONSchema } from '@speclynx/apidom-ns-json-schema-2020-12';

export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const detectionRegExp =
  /(?<YAML>^(["']?)\$schema\2\s*:\s*(["']?)https:\/\/json-schema\.org\/draft\/(?<version_yaml>2020-12)\/schema\3)|(?<JSON>"\$schema"\s*:\s*"https:\/\/json-schema\.org\/draft\/(?<version_json>2020-12)\/schema")/m;

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> =>
  detectionRegExp.test(source) && (await detectYAML(source));

/**
 * @public
 */
export const parse = async (
  source: string,
  options: Record<string, unknown> = {},
): Promise<ParseResultElement> => {
  const refractorOpts: Record<string, unknown> = propOr({}, 'refractorOpts', options);
  const parserOpts = omit(['refractorOpts'], options);
  const parseResultElement = await parseYAML(source, parserOpts);
  const { result } = parseResultElement;

  if (isNotUndefined(result)) {
    const jsonSchemaElement = refractJSONSchema(result, refractorOpts);
    jsonSchemaElement.classes.push('result');
    parseResultElement.replaceResult(jsonSchemaElement);
  }

  return parseResultElement;
};

/**
 * @public
 */
export const namespace = new Namespace().use(jsonSchemaNamespace);
