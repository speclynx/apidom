import ObjectSlice from '../ObjectSlice.ts';
import KeyValuePair from '../KeyValuePair.ts';
import Element from '../primitives/Element.ts';
import MemberElement from '../primitives/MemberElement.ts';
import { isElement } from '../predicates/index.ts';
import DeepCloneError from './errors/DeepCloneError.ts';
import ShallowCloneError from './errors/ShallowCloneError.ts';

/**
 * @public
 */
export type FinalCloneTypes = KeyValuePair | ObjectSlice;

/**
 * @public
 */
export type DeepCloneOptions = {
  visited?: WeakMap<object, object>;
};

const cloneDeepElement = (element: Element, options: DeepCloneOptions): Element => {
  const { visited = new WeakMap<object, object>() } = options;
  const passThroughOptions = { ...options, visited };

  // detect cycle and return memoized value
  if (visited.has(element)) {
    return visited.get(element) as Element;
  }

  const copy = cloneShallowElement(element);
  visited.set(element, copy);

  const { content } = element;
  if (Array.isArray(content)) {
    copy.content = content.map((el: Element) => cloneDeepElement(el, passThroughOptions));
  } else if (isElement(content)) {
    copy.content = cloneDeepElement(content as Element, passThroughOptions);
  } else if ((content as unknown) instanceof KeyValuePair) {
    copy.content = cloneDeepKeyValuePair(content as KeyValuePair, passThroughOptions);
  } else {
    copy.content = content;
  }

  return copy;
};

const cloneDeepKeyValuePair = (kvp: KeyValuePair, options: DeepCloneOptions): KeyValuePair => {
  const { visited = new WeakMap<object, object>() } = options;
  const passThroughOptions = { ...options, visited };

  if (visited.has(kvp)) {
    return visited.get(kvp) as KeyValuePair;
  }

  const { key, value } = kvp;
  const keyCopy = key !== undefined ? cloneDeepElement(key, passThroughOptions) : undefined;
  const valueCopy = value !== undefined ? cloneDeepElement(value, passThroughOptions) : undefined;
  const copy = new KeyValuePair(keyCopy, valueCopy);
  visited.set(kvp, copy);
  return copy;
};

const cloneDeepObjectSlice = (slice: ObjectSlice, options: DeepCloneOptions): ObjectSlice => {
  const { visited = new WeakMap<object, object>() } = options;
  const passThroughOptions = { ...options, visited };

  if (visited.has(slice)) {
    return visited.get(slice) as ObjectSlice;
  }

  const items = [...slice].map(
    (element) => cloneDeepElement(element, passThroughOptions) as MemberElement,
  );
  const copy = new ObjectSlice(items);
  visited.set(slice, copy);
  return copy;
};

/**
 * Creates a deep clone of an ApiDOM Element, KeyValuePair, or ObjectSlice.
 * Handles cycles by memoizing visited objects.
 * @public
 */
export const cloneDeep = <T extends Element | FinalCloneTypes>(
  value: T,
  options: DeepCloneOptions = {},
): T => {
  if (value instanceof KeyValuePair) {
    return cloneDeepKeyValuePair(value, options) as T;
  }

  if (value instanceof ObjectSlice) {
    return cloneDeepObjectSlice(value, options) as T;
  }

  if (isElement(value)) {
    return cloneDeepElement(value, options) as T;
  }

  throw new DeepCloneError("Value provided to cloneDeep function couldn't be cloned", {
    value,
  });
};
cloneDeep.safe = <T>(value: T): T => {
  try {
    return cloneDeep(value as Element | FinalCloneTypes) as T;
  } catch {
    return value;
  }
};

const cloneShallowKeyValuePair = (keyValuePair: KeyValuePair): KeyValuePair => {
  const { key, value } = keyValuePair;
  return new KeyValuePair(key, value);
};

const cloneShallowObjectSlice = (objectSlice: ObjectSlice): ObjectSlice => {
  const items = [...objectSlice];
  return new ObjectSlice(items);
};

const cloneShallowElement = <T extends Element>(element: T): T => {
  const Ctor = element.constructor as new () => T;
  const copy = new Ctor();

  copy.element = element.element;

  // @ts-ignore
  if (isElement(element._meta)) {
    // Use type assertion to access protected property for internal cloning
    (copy as unknown as { _meta: Element })._meta = cloneDeep(element.meta);
  }

  // @ts-ignore
  if (isElement(element._attributes)) {
    // Use type assertion to access protected property for internal cloning
    (copy as unknown as { _attributes: Element })._attributes = cloneDeep(element.attributes);
  }

  const { content } = element;
  if (isElement(content)) {
    copy.content = cloneShallowElement(content as Element);
  } else if (Array.isArray(content)) {
    copy.content = [...content];
  } else if ((content as unknown) instanceof KeyValuePair) {
    copy.content = cloneShallowKeyValuePair(content as KeyValuePair);
  } else {
    copy.content = content;
  }

  return copy;
};

/**
 * Creates a shallow clone of an ApiDOM Element, KeyValuePair, or ObjectSlice.
 * The element itself is cloned, but content references are shared (except for
 * meta and attributes which are deep cloned to preserve semantic information).
 * @public
 */
export const cloneShallow = <T extends Element | FinalCloneTypes>(value: T): T => {
  if (value instanceof KeyValuePair) {
    return cloneShallowKeyValuePair(value) as T;
  }

  if (value instanceof ObjectSlice) {
    return cloneShallowObjectSlice(value) as T;
  }

  if (isElement(value)) {
    return cloneShallowElement(value) as T;
  }

  throw new ShallowCloneError("Value provided to cloneShallow function couldn't be cloned", {
    value,
  });
};
cloneShallow.safe = <T>(value: T): T => {
  try {
    return cloneShallow(value as Element | FinalCloneTypes) as T;
  } catch {
    return value;
  }
};

export { default as CloneError } from './errors/CloneError.ts';
export type { CloneErrorOptions } from './errors/CloneError.ts';
export { default as DeepCloneError } from './errors/DeepCloneError.ts';
export { default as ShallowCloneError } from './errors/ShallowCloneError.ts';
