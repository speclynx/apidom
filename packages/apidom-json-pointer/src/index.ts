import { evaluate as baseEvaluate, JSONPointer } from '@swaggerexpert/json-pointer';
import type { EvaluationOptions } from '@swaggerexpert/json-pointer';

export {
  /**
   * Representation
   */
  JSONString,
  URIFragmentIdentifier,
  /**
   * Parsing
   */
  parse,
  CSTTranslator,
  ASTTranslator,
  XMLTranslator,
  /**
   * Testing
   */
  testJSONPointer,
  testReferenceToken,
  testArrayLocation,
  testArrayIndex,
  testArrayDash,
  /**
   * Compiling
   */
  compile,
  /**
   * Escaping
   */
  escape,
  unescape,
  /**
   * Grammar
   */
  Grammar,
  /**
   * Errors
   */
  JSONPointerError,
  JSONPointerParseError,
  JSONPointerCompileError,
  JSONPointerEvaluateError,
  JSONPointerTypeError,
  JSONPointerKeyError,
  JSONPointerIndexError,
} from '@swaggerexpert/json-pointer';

import ApiDOMEvaluationRealm from './realm.ts';

export { ApiDOMEvaluationRealm };

/**
 * @public
 */
export type ApiDOMRealmEvaluationOptions = Omit<EvaluationOptions, 'realm'>;

/**
 * @public
 */
export const evaluate = <T = unknown>(
  value: unknown,
  jsonPointer: JSONPointer,
  options: ApiDOMRealmEvaluationOptions = {},
): T => {
  return baseEvaluate(value, jsonPointer, { ...options, realm: new ApiDOMEvaluationRealm() });
};

/**
 * Re-export all types
 */
export type * from '@swaggerexpert/json-pointer';
