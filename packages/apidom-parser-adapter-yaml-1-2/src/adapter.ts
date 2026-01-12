import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';
import type { Tree } from 'web-tree-sitter';

import lexicalAnalysis from './lexical-analysis/index.ts';
import syntacticAnalysis from './syntactic-analysis/index.ts';

export type { YamlMediaTypes } from './media-types.ts';
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
export const detect = async (source: string): Promise<boolean> => {
  let cst: Tree | null = null;
  try {
    cst = await lexicalAnalysis(source);
    return !cst.rootNode.isError;
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
