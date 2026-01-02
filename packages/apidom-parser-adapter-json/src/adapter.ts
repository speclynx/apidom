import { ParseResultElement, Namespace } from '@speclynx/apidom-datamodel';

import lexicalAnalysis from './lexical-analysis/index.ts';
import syntacticAnalysisDirect from './syntactic-analysis/direct/index.ts';
import syntacticAnalysisIndirect from './syntactic-analysis/indirect/index.ts';

export type { JSONMediaTypes } from './media-types.ts';
export type { Tree } from './syntactic-analysis/indirect/index.ts';

export {
  lexicalAnalysis,
  syntacticAnalysisDirect as syntacticAnalysis,
  syntacticAnalysisDirect,
  syntacticAnalysisIndirect,
};

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

  try {
    const cst = await lexicalAnalysis(source);
    return cst.rootNode.type !== 'ERROR';
  } catch {
    return false;
  }
};

/**
 * @public
 */
export interface ParseFunctionOptions {
  sourceMap?: boolean;
  syntacticAnalysis?: 'direct' | 'indirect';
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
export const parse: ParseFunction = async (
  source,
  { sourceMap = false, syntacticAnalysis = 'direct' } = {},
) => {
  const cst = await lexicalAnalysis(source);
  let apiDOM;

  if (syntacticAnalysis === 'indirect') {
    apiDOM = syntacticAnalysisIndirect(cst, { sourceMap });
  } else {
    apiDOM = syntacticAnalysisDirect(cst, { sourceMap });
  }

  return apiDOM;
};
