import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import { ApiDOMError } from '@speclynx/apidom-error';

import * as yaml from './yaml/index.ts';
import * as treeSitter from './tree-sitter/index.ts';

export type { YamlMediaTypes } from './media-types.ts';
export type { Tree } from './tree-sitter/index.ts';

export { lexicalAnalysis, syntacticAnalysis } from './tree-sitter/index.ts';

/**
 * @public
 */
export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const namespace = new Namespace();

/**
 * @public
 */
export interface DetectOptions {
  strict?: boolean;
}

/**
 * @public
 */
export const detect = async (
  source: string,
  { strict = false }: DetectOptions = {},
): Promise<boolean> => {
  if (strict) {
    return yaml.detect(source);
  }
  return treeSitter.detect(source);
};

/**
 * @public
 */
export interface ParseFunctionOptions {
  sourceMap?: boolean;
  strict?: boolean;
}

/**
 * @public
 */
export type ParseFunction = (
  source: string,
  options?: ParseFunctionOptions,
) => Promise<ParseResultElement>;

/**
 * @public
 */
export const parse: ParseFunction = async (source, { sourceMap = false, strict = false } = {}) => {
  if (strict && sourceMap) {
    throw new ApiDOMError(
      'Cannot use sourceMap with strict parsing. Strict parsing does not support source maps.',
    );
  }

  if (strict) {
    return yaml.parse(source);
  }

  return treeSitter.parse(source, { sourceMap });
};
