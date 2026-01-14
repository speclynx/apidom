import { ParseResultElement } from '@speclynx/apidom-datamodel';
import type { Tree } from 'web-tree-sitter';

import lexicalAnalysis from './lexical-analysis/index.ts';
import syntacticAnalysis from './syntactic-analysis/index.ts';

export type { Tree };
export { lexicalAnalysis, syntacticAnalysis };

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
export interface ParseOptions {
  sourceMap?: boolean;
}

/**
 * @public
 */
export const parse = async (
  source: string,
  { sourceMap = false }: ParseOptions = {},
): Promise<ParseResultElement> => {
  const cst = await lexicalAnalysis(source);
  try {
    return syntacticAnalysis(cst, { sourceMap });
  } finally {
    cst.delete();
  }
};
