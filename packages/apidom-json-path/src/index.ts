import { evaluate as baseEvaluate } from '@swaggerexpert/jsonpath';

export {
  /**
   * Parsing
   */
  parse,
  CSTTranslator,
  CSTOptimizedTranslator,
  ASTTranslator,
  XMLTranslator,
  /**
   * Testing
   */
  test,
  /**
   * Normalized Path
   */
  NormalizedPath,
  /**
   * Evaluation
   */
  functions,
  EvaluationRealm,
  JSONEvaluationRealm,
  /**
   * Grammar
   */
  Grammar,
  /**
   * Errors
   */
  JSONPathError,
  JSONPathParseError,
  JSONNormalizedPathError,
  JSONPathEvaluateError,
} from '@swaggerexpert/jsonpath';

import ApiDOMEvaluationRealm from './realm.ts';

export { ApiDOMEvaluationRealm };

/**
 * Options for ApiDOM JSONPath evaluation.
 * @public
 */
export interface ApiDOMEvaluateOptions {
  /**
   * Optional callback called for each match.
   * @param value - The matched value
   * @param normalizedPath - The normalized path to the match
   */
  callback?: (value: unknown, normalizedPath: string) => void;
  /**
   * Optional custom function registry.
   * Can extend or override built-in functions (length, count, match, search, value).
   */
  functions?: Record<string, (...args: unknown[]) => unknown>;
}

/**
 * Evaluate a JSONPath expression against an ApiDOM element.
 *
 * @param value - ApiDOM element to query
 * @param expression - JSONPath expression
 * @param options - Evaluation options
 * @returns Array of matched values
 *
 * @example
 * ```typescript
 * import { ObjectElement } from '@speclynx/apidom-datamodel';
 * import { evaluate } from '@speclynx/apidom-json-path';
 *
 * const element = new ObjectElement({ a: { b: [1, 2, 3] } });
 * const results = evaluate(element, '$.a.b[*]');
 * // => [NumberElement(1), NumberElement(2), NumberElement(3)]
 * ```
 *
 * @public
 */
export const evaluate = <T = unknown>(
  value: unknown,
  expression: string,
  options: ApiDOMEvaluateOptions = {},
): T[] => {
  return baseEvaluate(value, expression, {
    ...options,
    realm: new ApiDOMEvaluationRealm(),
  });
};

/**
 * Re-export all types
 */
export type * from '@swaggerexpert/jsonpath';
