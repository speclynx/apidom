import { propOr, omit } from 'ramda';
import { isNotUndefined } from 'ramda-adjunct';
import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import {
  parse as parseJSON,
  detect as detectJSON,
  type ParseDetectOptions,
  type ParseOptions as ParseOptionsJSON,
} from '@speclynx/apidom-parser-adapter-json';
import jsonSchemaNamespace, { refractJSONSchema } from '@speclynx/apidom-ns-json-schema-2020-12';

export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const detectionRegExp =
  /"\$schema"\s*:\s*"https:\/\/json-schema\.org\/draft\/(?<version_json>2020-12)\/schema"/;

/**
 * @public
 */
export const detect: typeof detectJSON = async (
  source: string,
  options: ParseDetectOptions = {},
): Promise<boolean> => detectionRegExp.test(source) && (await detectJSON(source, options));

/**
 * @public
 */
export interface ParseOptions extends ParseOptionsJSON {
  refractorOpts?: Record<string, unknown>;
}

/**
 * @public
 */
export const parse: typeof parseJSON = async (
  source: string,
  options: ParseOptions = {},
): Promise<ParseResultElement> => {
  const refractorOpts: Record<string, unknown> = propOr({}, 'refractorOpts', options);
  const parserOpts = omit(['refractorOpts'], options);
  const parseResultElement = await parseJSON(source, parserOpts);
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
