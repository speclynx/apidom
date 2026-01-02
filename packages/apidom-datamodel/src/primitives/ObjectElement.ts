import CollectionElement from './CollectionElement.ts';
import MemberElement from './MemberElement.ts';
import ObjectSlice from '../ObjectSlice.ts';
import type Element from './Element.ts';
import type { Meta, Attributes } from './Element.ts';

/**
 * Callback type for ObjectElement iteration methods.
 * @public
 */
export type ObjectElementCallback<K extends Element, V extends Element, U> = (
  value: V,
  key: K,
  member: MemberElement<K, V>,
) => U;

/**
 * ObjectElement represents an object/dictionary of key-value pairs in ApiDOM.
 *
 * @typeParam K - The key element type, defaults to Element
 * @typeParam V - The value element type, defaults to Element
 * @public
 */
class ObjectElement<
  K extends Element = Element,
  V extends Element = Element,
> extends CollectionElement<MemberElement<K, V>> {
  constructor(
    content?: Record<string, unknown> | MemberElement<K, V>[],
    meta?: Meta,
    attributes?: Attributes,
  ) {
    super((content as unknown as unknown[]) || [], meta, attributes);
    this.element = 'object';
  }

  primitive(): string {
    return 'object';
  }

  toValue(): Record<string, unknown> {
    return this._content.reduce<Record<string, unknown>>((results, el) => {
      results[el.key!.toValue() as string] = el.value ? el.value.toValue() : undefined;
      return results;
    }, {});
  }

  /**
   * Gets the value element for the given key.
   */
  get(name: string): V | undefined {
    const member = this.getMember(name);

    if (member) {
      return member.value;
    }

    return undefined;
  }

  /**
   * Helper for returning the value of an item by key.
   */
  getValue(name: string): unknown {
    const item = this.get(name);

    if (item) {
      return item.toValue();
    }

    return undefined;
  }

  /**
   * Gets the member element for the given key.
   */
  getMember(name: string | undefined): MemberElement<K, V> | undefined {
    if (name === undefined) {
      return undefined;
    }

    return this._content.find((element) => element.key!.toValue() === name);
  }

  /**
   * Removes the member with the given key.
   */
  remove(name: string): MemberElement<K, V> | null {
    let removed: MemberElement<K, V> | null = null;

    this.content = this._content.filter((item) => {
      if (item.key!.toValue() === name) {
        removed = item;
        return false;
      }

      return true;
    });

    return removed;
  }

  /**
   * Gets the key element for the given key name.
   */
  getKey(name: string): K | undefined {
    const member = this.getMember(name);

    if (member) {
      return member.key;
    }

    return undefined;
  }

  /**
   * Set allows either a key/value pair to be given or an object.
   * If an object is given, each key is set to its respective value.
   */
  set(keyOrObject: string | Record<string, unknown>, value?: unknown): this {
    if (typeof keyOrObject === 'string') {
      const member = this.getMember(keyOrObject);

      if (member) {
        member.value = value;
      } else {
        this._content.push(new MemberElement(keyOrObject, value) as MemberElement<K, V>);
      }
    } else if (typeof keyOrObject === 'object' && !Array.isArray(keyOrObject)) {
      for (const objectKey of Object.keys(keyOrObject)) {
        this.set(objectKey, keyOrObject[objectKey]);
      }
    }

    return this;
  }

  /**
   * Returns an array of all keys' values.
   */
  keys(): unknown[] {
    return this._content.map((item) => item.key!.toValue());
  }

  /**
   * Returns an array of all values' values.
   */
  values(): unknown[] {
    return this._content.map((item) => item.value!.toValue());
  }

  /**
   * Returns whether the object has the given key.
   */
  hasKey(value: string): boolean {
    return this._content.some((member) => member.key!.equals(value));
  }

  /**
   * Returns an array of [key, value] pairs.
   */
  items(): [unknown, unknown][] {
    return this._content.map((item) => [item.key!.toValue(), item.value!.toValue()]);
  }

  /**
   * Maps over the member elements, calling callback with (value, key, member).
   */
  map<U>(callback: ObjectElementCallback<K, V, U>, thisArg?: unknown): U[] {
    return this._content.map((item) => callback.call(thisArg, item.value!, item.key!, item));
  }

  /**
   * Returns an array containing the truthy results of calling the given transformation.
   */
  compactMap<U>(
    callback: ObjectElementCallback<K, V, U | undefined | null>,
    thisArg?: unknown,
  ): U[] {
    const results: U[] = [];

    this.forEach((value, key, member) => {
      const result = callback.call(thisArg, value, key, member);

      if (result) {
        results.push(result);
      }
    });

    return results;
  }

  /**
   * Filters member elements using the provided callback.
   */
  filter(callback: ObjectElementCallback<K, V, boolean>, thisArg?: unknown): ObjectSlice {
    return new ObjectSlice(this._content).filter(
      callback as unknown as (value: Element, key: Element, member: MemberElement) => boolean,
      thisArg,
    );
  }

  /**
   * Rejects member elements that match the provided callback.
   */
  reject(callback: ObjectElementCallback<K, V, boolean>, thisArg?: unknown): ObjectSlice {
    const results: MemberElement<K, V>[] = [];
    for (const member of this._content) {
      if (!callback.call(thisArg, member.value!, member.key!, member)) {
        results.push(member);
      }
    }
    return new ObjectSlice(results);
  }

  /**
   * Executes a provided function once for each member element.
   */
  forEach(
    callback: (value: V, key: K, member: MemberElement<K, V>) => void,
    thisArg?: unknown,
  ): void {
    this._content.forEach((item) => callback.call(thisArg, item.value!, item.key!, item));
  }

  /**
   * Reduces the object to a single value.
   * Callback receives (memo, value, key, member, obj).
   */
  reduce<U>(
    callback: (memo: U, value: V, key: K, member: MemberElement<K, V>, obj: this) => U,
    initialValue?: U,
  ): U {
    let startIndex: number;
    let memo: U;

    if (initialValue !== undefined) {
      startIndex = 0;
      memo = this.refract(initialValue) as unknown as U;
    } else {
      startIndex = 1;
      // For objects, memo starts as the first member's value
      memo = this._content[0]?.value as unknown as U;
    }

    for (let i = startIndex; i < this._content.length; i += 1) {
      const member = this._content[i];
      const result = callback(memo, member.value!, member.key!, member, this);
      memo = result === undefined ? result : (this.refract(result) as unknown as U);
    }

    return memo;
  }

  /**
   * Returns an empty object element.
   */
  empty(): this {
    return new (this.constructor as new (content: unknown[]) => this)([]);
  }
}

export default ObjectElement;
