import {
  evaluate as baseEvaluate,
  EvaluationRealm,
  JSONPointerIndexError,
  JSONPointerKeyError,
  JSONPointer,
} from '@swaggerexpert/json-pointer';
import type { EvaluationOptions } from '@swaggerexpert/json-pointer';
import { isArrayElement, isObjectElement } from '@speclynx/apidom-core';

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
/**
 * Contextual Evaluation for ApiDOM
 */
class ApiDOMEvaluationRealm extends EvaluationRealm {
  name = 'apidom';

  isArray(node: unknown) {
    return isArrayElement(node);
  }

  isObject(node: unknown) {
    return isObjectElement(node);
  }

  sizeOf(node: unknown) {
    if (this.isArray(node) || this.isObject(node)) {
      return node.length;
    }
    return 0;
  }

  has(node: unknown, referenceToken: string) {
    if (this.isArray(node)) {
      const index = Number(referenceToken);
      const indexUint32 = index >>> 0;

      if (index !== indexUint32) {
        throw new JSONPointerIndexError(
          `Invalid array index "${referenceToken}": index must be an unsinged 32-bit integer`,
          {
            referenceToken,
            currentValue: node,
            realm: this.name,
          },
        );
      }

      return indexUint32 < this.sizeOf(node);
    }
    if (this.isObject(node)) {
      const keys = node.keys();
      const uniqueKeys = new Set(keys);

      if (keys.length !== uniqueKeys.size) {
        throw new JSONPointerKeyError(
          `Object key "${referenceToken}" is not unique — JSON Pointer requires unique member names`,
          {
            referenceToken,
            currentValue: node,
            realm: this.name,
          },
        );
      }

      return node.hasKey(referenceToken);
    }
    return false;
  }

  evaluate(node: unknown, referenceToken: string) {
    if (this.isArray(node)) {
      return node.get(Number(referenceToken));
    }
    if (this.isObject(node)) {
      return node.get(referenceToken);
    }
    return undefined;
  }
}

export type ApiDOMRealmEvaluationOptions = Omit<EvaluationOptions, 'realm'>;

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
