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
import ShortUniqueId from 'short-unique-id';

import toValue from './value.ts';
import setProperty from '../../util.ts';

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

// sentinels are substituted by a textual pass over the serialized JSON, so a
// document string shaped like a sentinel would be substituted as well. A random
// per-invocation nonce makes the sentinel unforgeable by document content.
const nonceGenerator = new ShortUniqueId({ length: 12 });

/**
 * Builds a `JSON.stringify` / `yaml.stringify` replacer that terminates on cycles.
 *
 * `toValue` returns a genuinely cyclic POJO for a cyclic element tree — it
 * memoises visited elements and hands back the same object on revisit — and
 * neither stringifier can represent that. The replacer keeps the chain of
 * ancestors of the value currently being serialized and emits `null` in place
 * of any value already in that chain, matching what the style preserving paths
 * do.
 *
 * Only ancestors terminate serialization. A shared reference to an already
 * serialized sibling is a DAG, not a cycle, and is expanded again.
 *
 * @param replacer - user supplied replacer, applied before the cycle check
 */
export const createCycleSafeReplacer = (
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
) => {
  const ancestors: unknown[] = [];

  return function cycleSafeReplacer(this: unknown, key: string, value: unknown): unknown {
    const replaced = typeof replacer === 'function' ? replacer.call(this, key, value) : value;

    if (typeof replaced !== 'object' || replaced === null) return replaced;

    // `this` is the holder of the current value; unwind to it so that only
    // genuine ancestors remain on the chain
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();

    if (ancestors.includes(replaced)) return null;

    ancestors.push(replaced);

    return replaced;
  };
};

/**
 * Builds a POJO from an ApiDOM element tree. Numbers with rawContent
 * are replaced with sentinel strings; all other values go through toValue().
 */
const toPojo = (element: Element, sentinels: Map<string, string>, nonce: string): unknown => {
  const ancestors = new WeakSet<object>();

  const convert = (node: unknown): unknown => {
    if (!isElement(node)) return node;

    // cycle detection — only ancestors form a cycle; a shared reference to an
    // already serialized sibling is a DAG and must be expanded again
    if (ancestors.has(node as object)) return null;

    if (isObjectElement(node)) {
      ancestors.add(node as object);
      const obj: Record<string, unknown> = {};
      node.forEach((value, key) => {
        const k = isElement(key) ? toValue(key) : key;
        if (typeof k === 'string') setProperty(obj, k, convert(value));
      });
      ancestors.delete(node as object);
      return obj;
    }

    if (isArrayElement(node)) {
      ancestors.add(node as object);
      const arr: unknown[] = [];
      node.forEach((item) => arr.push(convert(item)));
      ancestors.delete(node as object);
      return arr;
    }

    if (isRefElement(node)) return String(toValue(node));
    if (isLinkElement(node)) return isStringElement(node.href) ? toValue(node.href) : '';

    // number with rawContent — substitute with sentinel
    if (isNumberElement(node)) {
      const style = getStyle(node);
      if (typeof style.rawContent === 'string') {
        const sentinel = `\0RAW${nonce}_${sentinels.size}\0`;
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

    const nonce = nonceGenerator.randomUUID();
    const sentinels = new Map<string, string>();
    const pojo = toPojo(element, sentinels, nonce);
    let serialized = JSON.stringify(pojo, null, indent);

    // replace quoted sentinels with raw number representations; a single pass
    // keeps this linear in the output size regardless of how many sentinels
    // were minted (a shared NumberElement mints one per occurrence). The map
    // lookup is the authority — sentinel-shaped document strings are not in it
    // and are left untouched
    serialized = serialized.replace(
      /"\\u0000RAW\w+\\u0000"/g,
      (match) => sentinels.get(JSON.parse(match) as string) ?? match,
    );

    return serialized;
  }

  const value = toValue(element);

  try {
    return JSON.stringify(value, replacer, space);
  } catch (error: unknown) {
    // a cyclic element tree yields a cyclic POJO; retry with a replacer that
    // emits null at the cycle. Only this specific failure is retried, and the
    // native fast path is what runs for every acyclic document.
    if (error instanceof TypeError && error.message.includes('circular structure')) {
      return JSON.stringify(value, createCycleSafeReplacer(replacer), space);
    }
    throw error;
  }
};

export default serializer;
