import {
  ObjectElement,
  ArrayElement,
  isObjectElement,
  isArrayElement,
} from '@speclynx/apidom-datamodel';
import {
  EvaluationRealm,
  JSONPointerIndexError,
  JSONPointerKeyError,
} from '@swaggerexpert/json-pointer';

class ApiDOMEvaluationRealm extends EvaluationRealm {
  name = 'apidom';

  isArray(node: unknown): node is ArrayElement {
    return isArrayElement(node);
  }

  isObject(node: unknown): node is ObjectElement {
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

  evaluate<T = unknown>(node: unknown, referenceToken: string): T {
    if (this.isArray(node)) {
      return node.get(Number(referenceToken)) as T;
    }
    return (node as ObjectElement).get(referenceToken) as T;
  }
}

export default ApiDOMEvaluationRealm;
