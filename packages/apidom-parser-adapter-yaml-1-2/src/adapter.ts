import { ParseResultElement, createNamespace } from '@speclynx/apidom-core';

import lexicalAnalysis from './lexical-analysis/index.ts';
import syntacticAnalysis from './syntactic-analysis/indirect/index.ts';

export type { YamlMediaTypes } from './media-types.ts';
export type { Tree } from './syntactic-analysis/indirect/index.ts';
export { lexicalAnalysis, syntacticAnalysis };

/**
 * @public
 */
export { default as mediaTypes } from './media-types.ts';

/**
 * @public
 */
export const namespace = createNamespace();

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> => {
  try {
    const cst = await lexicalAnalysis(source);
    return !cst.rootNode.isError;
  } catch {
    return false;
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
  return syntacticAnalysis(cst, { sourceMap });
};
