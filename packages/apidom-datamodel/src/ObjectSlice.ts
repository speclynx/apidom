import type Element from './primitives/Element.ts';
import type MemberElement from './primitives/MemberElement.ts';

/**
 * Callback type for ObjectSlice iteration methods.
 * Receives (value, key, member) - the standard pattern for object-like iteration.
 * @public
 */
export type ObjectSliceCallback<U> = (value: Element, key: Element, member: MemberElement) => U;

/**
 * Callback type for ObjectSlice forEach that also receives the index.
 * @public
 */
export type ObjectSliceForEachCallback = (
  value: Element,
  key: Element,
  member: MemberElement,
  index: number,
) => void;

/**
 * ObjectSlice is a collection wrapper for MemberElement arrays.
 * It provides functional methods with (value, key, member) callback signatures,
 * which is the standard pattern for iterating over object-like structures.
 *
 * Unlike ArraySlice, ObjectSlice uses composition rather than inheritance
 * because its callback signatures are fundamentally different.
 *
 * @public
 */
class ObjectSlice {
  public readonly elements: MemberElement[];

  constructor(elements?: MemberElement[]) {
    this.elements = elements ?? [];
  }

  /**
   * Converts all member elements to their JavaScript values.
   * Returns an array of \{ key, value \} objects.
   */
  toValue(): Array<{ key: unknown; value: unknown }> {
    return this.elements.map((member) => ({
      key: member.key?.toValue(),
      value: member.value?.toValue(),
    }));
  }

  /**
   * Maps over the member elements, calling callback with (value, key, member).
   * @param callback - Function to execute for each member
   * @param thisArg - Value to use as this when executing callback
   */
  map<U>(callback: ObjectSliceCallback<U>, thisArg?: unknown): U[] {
    return this.elements.map((member) => {
      const value = member.value;
      const key = member.key;

      if (value === undefined || key === undefined) {
        throw new Error('MemberElement must have both key and value');
      }

      return thisArg !== undefined
        ? callback.call(thisArg, value, key, member)
        : callback(value, key, member);
    });
  }

  /**
   * Filters member elements using the provided callback.
   * @param callback - Function that receives (value, key, member) and returns boolean
   * @param thisArg - Value to use as this when executing callback
   */
  filter(callback: ObjectSliceCallback<boolean>, thisArg?: unknown): ObjectSlice {
    const filtered = this.elements.filter((member) => {
      const value = member.value;
      const key = member.key;

      if (value === undefined || key === undefined) {
        return false; // Skip malformed members
      }

      return thisArg !== undefined
        ? callback.call(thisArg, value, key, member)
        : callback(value, key, member);
    });

    return new ObjectSlice(filtered);
  }

  /**
   * Rejects member elements that match the provided callback.
   * @param callback - Function that receives (value, key, member) and returns boolean
   * @param thisArg - Value to use as this when executing callback
   */
  reject(callback: ObjectSliceCallback<boolean>, thisArg?: unknown): ObjectSlice {
    const results: MemberElement[] = [];
    for (const member of this.elements) {
      const value = member.value;
      const key = member.key;

      if (value === undefined || key === undefined) {
        continue;
      }

      if (!callback.call(thisArg, value, key, member)) {
        results.push(member);
      }
    }
    return new ObjectSlice(results);
  }

  /**
   * Executes a provided function once for each member element.
   * @param callback - Function that receives (value, key, member, index)
   * @param thisArg - Value to use as this when executing callback
   */
  forEach(callback: ObjectSliceForEachCallback, thisArg?: unknown): void {
    this.elements.forEach((member, index) => {
      const value = member.value;
      const key = member.key;

      if (value === undefined || key === undefined) {
        return; // Skip malformed members
      }

      if (thisArg !== undefined) {
        callback.call(thisArg, value, key, member, index);
      } else {
        callback(value, key, member, index);
      }
    });
  }

  /**
   * Returns the first member element that satisfies the callback.
   * @param callback - Function that receives (value, key, member) and returns boolean
   * @param thisArg - Value to use as this when executing callback
   */
  find(callback: ObjectSliceCallback<boolean>, thisArg?: unknown): MemberElement | undefined {
    return this.elements.find((member) => {
      const value = member.value;
      const key = member.key;

      if (value === undefined || key === undefined) {
        return false;
      }

      return thisArg !== undefined
        ? callback.call(thisArg, value, key, member)
        : callback(value, key, member);
    });
  }

  /**
   * Returns an array of all keys' values.
   */
  keys(): unknown[] {
    return this.elements
      .map((member) => member.key?.toValue())
      .filter((key): key is unknown => key !== undefined);
  }

  /**
   * Returns an array of all values' values.
   */
  values(): unknown[] {
    return this.elements
      .map((member) => member.value?.toValue())
      .filter((value): value is unknown => value !== undefined);
  }

  /**
   * Returns the number of elements in the slice.
   */
  get length(): number {
    return this.elements.length;
  }

  /**
   * Returns whether the slice is empty.
   */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Returns the first element in the slice or undefined if empty.
   */
  get first(): MemberElement | undefined {
    return this.elements[0];
  }

  /**
   * Gets the element at the specified index.
   * @param index - The index of the element to get
   */
  get(index: number): MemberElement | undefined {
    return this.elements[index];
  }

  /**
   * Adds the given member element to the end of the slice.
   * @param member - The member element to add
   */
  push(member: MemberElement): this {
    this.elements.push(member);
    return this;
  }

  /**
   * Determines whether the slice includes a member with the given key value.
   * @param keyValue - The key value to search for
   */
  includesKey(keyValue: unknown): boolean {
    return this.elements.some((member) => member.key?.equals(keyValue));
  }

  /**
   * Iterator support - allows for...of loops.
   */
  [Symbol.iterator](): IterableIterator<MemberElement> {
    return this.elements[Symbol.iterator]();
  }
}

export default ObjectSlice;
