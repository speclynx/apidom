import {
  Element,
  isElement,
  isObjectElement,
  isArrayElement,
  isRefElement,
  isLinkElement,
  isStringElement,
  isNumberElement,
  isBooleanElement,
  isNullElement,
} from '@speclynx/apidom-datamodel';

import serializeValue from './value.ts';

/**
 * @public
 */
export interface JsonSerializerOptions {
  replacer?: (this: any, key: string, value: any) => any;
  space?: string | number;
  /** Preserve original formatting styles from element.style.json */
  preserveStyle?: boolean;
}

/**
 * Custom JSON writer that walks the ApiDOM element tree directly,
 * preserving style information from element.style.json (e.g., rawContent for numbers).
 */
const toJsonString = (element: Element, indent: number): string => {
  const visited = new WeakSet<object>();
  const indentStr = indent > 0 ? ' '.repeat(indent) : '';

  const serialize = (node: unknown, depth: number): string => {
    if (!isElement(node)) {
      return JSON.stringify(node);
    }

    // cycle detection
    if (visited.has(node as object)) return 'null';
    visited.add(node as object);

    if (isObjectElement(node)) {
      const entries: string[] = [];
      const sep = indent > 0 ? ': ' : ':';
      node.forEach((value, key) => {
        const k = JSON.stringify(isElement(key) ? key.toValue() : key);
        const v = serialize(value, depth + 1);
        entries.push(`${k}${sep}${v}`);
      });

      if (entries.length === 0) return '{}';

      if (indent > 0) {
        const innerIndent = indentStr.repeat(depth + 1);
        const outerIndent = indentStr.repeat(depth);
        return `{\n${entries.map((e) => `${innerIndent}${e}`).join(',\n')}\n${outerIndent}}`;
      }

      return `{${entries.join(',')}}`;
    }

    if (isArrayElement(node)) {
      const items: string[] = [];
      node.forEach((item) => {
        items.push(serialize(item, depth + 1));
      });

      if (items.length === 0) return '[]';

      if (indent > 0) {
        const innerIndent = indentStr.repeat(depth + 1);
        const outerIndent = indentStr.repeat(depth);
        return `[\n${items.map((item) => `${innerIndent}${item}`).join(',\n')}\n${outerIndent}]`;
      }

      return `[${items.join(',')}]`;
    }

    if (isRefElement(node)) {
      return JSON.stringify(String(node.toValue()));
    }

    if (isLinkElement(node)) {
      return JSON.stringify(isStringElement(node.href) ? node.href.toValue() : '');
    }

    // number with rawContent
    if (isNumberElement(node)) {
      const jsonStyle = (node.style?.json ?? {}) as Record<string, unknown>;
      if (typeof jsonStyle.rawContent === 'string') {
        return jsonStyle.rawContent;
      }
      return JSON.stringify(node.toValue());
    }

    if (isStringElement(node) || isBooleanElement(node) || isNullElement(node)) {
      return JSON.stringify(node.toValue());
    }

    return JSON.stringify(node.toValue());
  };

  return serialize(element, 0);
};

/**
 * @public
 */
const serializer = (
  element: Element,
  replacerOrOptions?: ((this: any, key: string, value: any) => any) | JsonSerializerOptions,
  space?: string | number,
): string => {
  // options object form: toJSON(element, { preserveStyle: true })
  if (replacerOrOptions != null && typeof replacerOrOptions === 'object') {
    const { replacer, space: optSpace, preserveStyle = false } = replacerOrOptions;

    if (preserveStyle) {
      const jsonStyle = (element.style?.json ?? {}) as Record<string, unknown>;
      const indent =
        typeof optSpace === 'number'
          ? optSpace
          : typeof jsonStyle.indent === 'number'
            ? (jsonStyle.indent as number)
            : 0;
      return toJsonString(element, indent);
    }

    return JSON.stringify(serializeValue(element), replacer, optSpace);
  }

  // legacy positional form: toJSON(element, replacer?, space?)
  return JSON.stringify(serializeValue(element), replacerOrOptions, space);
};

export default serializer;
