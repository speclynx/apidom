import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import { UnsupportedOperationError } from '@speclynx/apidom-error';

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
export interface ParseDetectOptions {
  strict?: boolean;
}

/**
 * @public
 */
export const detect = async (
  source: string,
  { strict = false }: ParseDetectOptions = {},
): Promise<boolean> => {
  if (strict) {
    return yaml.detect(source);
  }
  return treeSitter.detect(source);
};

/**
 * @public
 */
export interface ParseOptions {
  sourceMap?: boolean;
  strict?: boolean;
}

/**
 * @public
 */
export const parse = async (
  source: string,
  { sourceMap = false, strict = false }: ParseOptions = {},
): Promise<ParseResultElement> => {
  if (strict && sourceMap) {
    throw new UnsupportedOperationError(
      'Cannot use sourceMap with strict parsing. Strict parsing does not support source maps.',
    );
  }

  if (strict) {
    return yaml.parse(source);
  }

  return treeSitter.parse(source, { sourceMap });
};
