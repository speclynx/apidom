import {
  Element,
  isElement,
  isObjectElement,
  isArrayElement,
  isRefElement,
  isLinkElement,
  isStringElement,
  isNumberElement,
} from '@speclynx/apidom-datamodel';

import toValue from './value.ts';

interface JSONElementStyle {
  indent?: number;
  rawContent?: string;
}

const getStyle = (element: Element): JSONElementStyle => {
  return (element.style?.json ?? {}) as JSONElementStyle;
};

/**
 * @public
 */
export interface JSONSerializerOptions {
  /** Preserve original formatting styles from `element.style.json` */
  preserveStyle?: boolean;
}

/**
 * Builds a POJO from an ApiDOM element tree. Numbers with rawContent
 * are replaced with sentinel strings; all other values go through toValue().
 */
const toPojo = (element: Element, sentinels: Map<string, string>): unknown => {
  const visited = new WeakSet<object>();

  const convert = (node: unknown): unknown => {
    if (!isElement(node)) return node;

    if (visited.has(node as object)) return null;
    visited.add(node as object);

    if (isObjectElement(node)) {
      const obj: Record<string, unknown> = {};
      node.forEach((value, key) => {
        const k = isElement(key) ? toValue(key) : key;
        if (typeof k === 'string') obj[k] = convert(value);
      });
      return obj;
    }

    if (isArrayElement(node)) {
      const arr: unknown[] = [];
      node.forEach((item) => arr.push(convert(item)));
      return arr;
    }

    if (isRefElement(node)) return String(toValue(node));
    if (isLinkElement(node)) return isStringElement(node.href) ? toValue(node.href) : '';

    // number with rawContent — substitute with sentinel
    if (isNumberElement(node)) {
      const style = getStyle(node);
      if (typeof style.rawContent === 'string') {
        const sentinel = `\0RAW${sentinels.size}\0`;
        sentinels.set(sentinel, style.rawContent);
        return sentinel;
      }
    }

    return toValue(node);
  };

  return convert(element);
};

/**
 * @public
 */
const serializer = (
  element: Element,
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
  space?: string | number,
  options?: JSONSerializerOptions,
): string => {
  if (options?.preserveStyle) {
    const style = getStyle(element);
    const indent =
      typeof space === 'number' ? space : typeof style.indent === 'number' ? style.indent : 0;

    const sentinels = new Map<string, string>();
    const pojo = toPojo(element, sentinels);
    let serialized = JSON.stringify(pojo, null, indent);

    // replace quoted sentinels with raw number representations
    for (const [sentinel, raw] of sentinels) {
      serialized = serialized.replace(JSON.stringify(sentinel), raw);
    }

    return serialized;
  }

  return JSON.stringify(toValue(element), replacer, space);
};

export default serializer;
