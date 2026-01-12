import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import type { Tree } from 'web-tree-sitter';

import lexicalAnalysis from './lexical-analysis/index.ts';
import syntacticAnalysis from './syntactic-analysis/index.ts';

export type { JSONMediaTypes } from './media-types.ts';
export type { Tree };

export { lexicalAnalysis, syntacticAnalysis };

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
export const detectionRegExp =
  // eslint-disable-next-line no-control-regex
  /(?<true>^\s*true\s*$)|(?<false>^\s*false\s*$)|(?<null>^\s*null\s*$)|(?<number>^\s*\d+\s*$)|(?<object>^\s*{\s*)|(?<array>^\s*\[\s*)|(?<string>^\s*"(((?=\\)\\(["\\/bfnrt]|u[0-9a-fA-F]{4}))|[^"\\\x00-\x1F\x7F])*"\s*$)/;

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> => {
  if (!detectionRegExp.test(source)) {
    return false;
  }

  let cst: Tree | null = null;
  try {
    cst = await lexicalAnalysis(source);
    return cst.rootNode.type !== 'ERROR';
  } catch {
    return false;
  } finally {
    cst?.delete();
  }
};

/**
 * @public
 */
export interface ParseFunctionOptions {
  sourceMap?: boolean;
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
export const parse: ParseFunction = async (source, { sourceMap = false } = {}) => {
  const cst = await lexicalAnalysis(source);
  try {
    return syntacticAnalysis(cst, { sourceMap });
  } finally {
    cst.delete();
  }
};
