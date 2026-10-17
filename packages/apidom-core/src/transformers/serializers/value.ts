import {
  Element,
  isElement,
  isObjectElement,
  isArrayElement,
  isRefElement,
  isLinkElement,
  isStringElement,
  isBooleanElement,
  isNumberElement,
  isNullElement,
  includesClasses,
} from '@speclynx/apidom-datamodel';

import setProperty, { toPropertyName } from '../../util.ts';

// an empty YAML node (YAML 1.2 §7.2) is a null parsed as an empty string with the yaml-e-node class
const isEmptyNode = (element: Element): boolean =>
  isStringElement(element) && element.toValue() === '' && includesClasses(element, ['yaml-e-node']);

/**
 * Transforms the ApiDOM into JavaScript POJO.
 * This POJO would be the result of interpreting the ApiDOM
 * into JavaScript structure.
 * @public
 */
const serializer = <T extends Element | unknown>(element: T): unknown => {
  if (!isElement(element)) return element;
  if (isEmptyNode(element)) return null;

  // Shortcut optimization for primitive element types
  if (
    isStringElement(element) ||
    isNumberElement(element) ||
    isBooleanElement(element) ||
    isNullElement(element)
  ) {
    return element.toValue();
  }

  // WeakMap for cycle handling - stores references to already-visited elements
  const references = new WeakMap<Element, object | unknown[]>();

  const serialize = (node: unknown): unknown => {
    if (!isElement(node)) return node;

    if (isObjectElement(node)) {
      if (references.has(node)) return references.get(node);
      const obj: Record<string, unknown> = {};
      references.set(node, obj);
      node.forEach((value, key) => {
        const k = serialize(key);
        const v = serialize(value);
        const name = toPropertyName(k);
        if (name !== undefined) setProperty(obj, name, v);
      });
      return obj;
    }

    if (isArrayElement(node)) {
      if (references.has(node)) return references.get(node);
      const arr: unknown[] = [];
      references.set(node, arr);
      node.forEach((item) => arr.push(serialize(item)));
      return arr;
    }

    if (isRefElement(node)) return String(node.toValue());
    if (isLinkElement(node)) {
      return isStringElement(node.href) ? node.href.toValue() : '';
    }
    if (isEmptyNode(node)) return null;

    return node.toValue();
  };

  return serialize(element);
};

export default serializer;
