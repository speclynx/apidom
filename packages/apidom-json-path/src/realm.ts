import {
  ObjectElement,
  ArrayElement,
  isObjectElement,
  isArrayElement,
  isStringElement,
  isNumberElement,
  isBooleanElement,
  isNullElement,
  refract,
} from '@speclynx/apidom-datamodel';
import { EvaluationRealm } from '@swaggerexpert/jsonpath';

/**
 * ApiDOM Evaluation Realm implementation for JSONPath.
 * @public
 */
class ApiDOMEvaluationRealm extends EvaluationRealm {
  override name = 'apidom';

  override isObject(value: unknown): value is ObjectElement {
    return isObjectElement(value);
  }

  override isArray(value: unknown): value is ArrayElement {
    return isArrayElement(value);
  }

  override isString(value: unknown): boolean {
    return isStringElement(value);
  }

  override isNumber(value: unknown): boolean {
    return isNumberElement(value);
  }

  override isBoolean(value: unknown): boolean {
    return isBooleanElement(value);
  }

  override isNull(value: unknown): boolean {
    return isNullElement(value);
  }

  override getString(value: unknown): string | undefined {
    if (isStringElement(value)) return value.toValue() as string;
    if (typeof value === 'string') return value;
    return undefined;
  }

  override getProperty(value: unknown, key: string): unknown {
    if (!isObjectElement(value)) return undefined;
    if (!value.hasKey(key)) return undefined;
    return value.get(key);
  }

  override hasProperty(value: unknown, key: string): boolean {
    if (!isObjectElement(value)) return false;
    return value.hasKey(key);
  }

  override getElement(value: unknown, index: number): unknown {
    if (!isArrayElement(value)) return undefined;
    if (index < 0 || index >= value.length) return undefined;
    return value.get(index);
  }

  override getKeys(value: unknown): string[] {
    if (!isObjectElement(value)) return [];
    return value.keys() as string[];
  }

  override getLength(value: unknown): number {
    if (isStringElement(value)) return [...(value.toValue() as string)].length;
    if (isArrayElement(value)) return value.length;
    if (isObjectElement(value)) return value.length;
    if (typeof value === 'string') return [...value].length;
    if (Array.isArray(value)) return value.length;
    return 0;
  }

  override *entries(value: unknown): Iterable<[string | number, unknown]> {
    if (isArrayElement(value)) {
      let index = 0;
      for (const item of value) {
        yield [index, item];
        index += 1;
      }
    } else if (isObjectElement(value)) {
      for (const member of value) {
        yield [member.key!.toValue() as string, member.value];
      }
    }
  }

  override compare(left: unknown, operator: string, right: unknown): boolean {
    // Handle Nothing (undefined) comparisons
    if (left === undefined || right === undefined) {
      if (operator === '==') return left === undefined && right === undefined;
      if (operator === '!=') return !(left === undefined && right === undefined);
      return false;
    }

    // Check if both are numbers (elements or primitives)
    const leftIsNumber = isNumberElement(left) || typeof left === 'number';
    const rightIsNumber = isNumberElement(right) || typeof right === 'number';

    // For numeric values, use primitive comparison with -0 normalization (RFC 9535)
    if (leftIsNumber && rightIsNumber) {
      const leftPrimitive = (isNumberElement(left) ? left.toValue() : left) as number;
      const rightPrimitive = (isNumberElement(right) ? right.toValue() : right) as number;
      const leftVal = Object.is(leftPrimitive, -0) ? 0 : leftPrimitive;
      const rightVal = Object.is(rightPrimitive, -0) ? 0 : rightPrimitive;

      switch (operator) {
        case '==':
          return leftVal === rightVal;
        case '!=':
          return leftVal !== rightVal;
        case '<':
          return leftVal < rightVal;
        case '>':
          return leftVal > rightVal;
        case '<=':
          return leftVal <= rightVal;
        case '>=':
          return leftVal >= rightVal;
        default:
          return false;
      }
    }

    // Check if both are strings (elements or primitives)
    const leftIsString = isStringElement(left) || typeof left === 'string';
    const rightIsString = isStringElement(right) || typeof right === 'string';

    // For string values, use primitive comparison
    if (leftIsString && rightIsString) {
      const leftVal = (isStringElement(left) ? left.toValue() : left) as string;
      const rightVal = (isStringElement(right) ? right.toValue() : right) as string;

      switch (operator) {
        case '==':
          return leftVal === rightVal;
        case '!=':
          return leftVal !== rightVal;
        case '<':
          return leftVal < rightVal;
        case '>':
          return leftVal > rightVal;
        case '<=':
          return leftVal <= rightVal;
        case '>=':
          return leftVal >= rightVal;
        default:
          return false;
      }
    }

    // For other types (booleans, nulls), only equality operators are defined (RFC 9535)
    if (operator === '==') {
      return refract(left).equals(right);
    }
    if (operator === '!=') {
      return !refract(left).equals(right);
    }
    // Comparison operators (<, >, <=, >=) are not defined for non-numeric, non-string types
    return false;
  }
}

export default ApiDOMEvaluationRealm;
