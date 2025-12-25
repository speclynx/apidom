import CollectionElement from './CollectionElement.ts';
import type Element from './Element.ts';
import type { Meta, Attributes } from './Element.ts';

// Re-export types from CollectionElement
export type { FindCondition, FindOptions } from './CollectionElement.ts';

/**
 * ArrayElement represents an array/collection of elements in ApiDOM.
 *
 * @typeParam T - The element type contained in the array, defaults to Element
 * @public
 */
class ArrayElement<T extends Element = Element> extends CollectionElement<T> {
  // Static Fantasy Land methods
  static empty<T extends Element = Element>(): ArrayElement<T> {
    return new this();
  }

  static 'fantasy-land/empty'<T extends Element = Element>(): ArrayElement<T> {
    return ArrayElement.empty<T>();
  }

  constructor(content?: unknown[], meta?: Meta, attributes?: Attributes) {
    super(content || [], meta, attributes);
    this.element = 'array';
  }

  primitive(): string {
    return 'array';
  }

  /**
   * Gets the element at the specified index.
   */
  get(index: number): T | undefined {
    return this._content[index];
  }

  /**
   * Helper for returning the value of an item.
   */
  getValue(index: number): unknown {
    const item = this.get(index);

    if (item) {
      return item.toValue();
    }

    return undefined;
  }

  /**
   * Sets the element at the specified index, or sets the content if called with one argument.
   */
  set(indexOrContent: number | unknown, value?: unknown): this {
    if (typeof indexOrContent === 'number' && value !== undefined) {
      this._content[indexOrContent] = this.refract(value) as T;
    } else {
      // Delegate to parent set behavior
      this.content = indexOrContent;
    }
    return this;
  }

  /**
   * Removes the element at the specified index.
   */
  remove(index: number): T | null {
    return this._content.splice(index, 1)[0] ?? null;
  }

  /**
   * Maps each element using the provided callback function.
   */
  map<U>(callback: (element: T, index: number, array: T[]) => U, thisArg?: unknown): U[] {
    return this._content.map(callback, thisArg);
  }

  /**
   * Maps and then flattens the results.
   */
  flatMap<U>(callback: (element: T, index: number, array: T[]) => U | U[], thisArg?: unknown): U[] {
    return this._content.flatMap(callback, thisArg);
  }

  /**
   * Returns an array containing the truthy results of calling the given transformation.
   */
  compactMap<U>(transform: (element: T) => U | undefined | null, thisArg?: unknown): U[] {
    const results: U[] = [];

    for (const element of this._content) {
      const result = transform.call(thisArg, element);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Filters elements using the provided callback.
   */
  filter(callback: (element: T) => boolean, thisArg?: unknown): ArrayElement<T> {
    const filtered = this._content.filter(callback, thisArg);
    return new (this.constructor as new (content: T[]) => ArrayElement<T>)(filtered);
  }

  /**
   * Rejects elements that match the provided callback.
   */
  reject(callback: (element: T) => boolean, thisArg?: unknown): ArrayElement<T> {
    const results: T[] = [];
    for (const element of this._content) {
      if (!callback.call(thisArg, element)) {
        results.push(element);
      }
    }
    return new (this.constructor as new (content: T[]) => ArrayElement<T>)(results);
  }

  /**
   * Reduces the array to a single value.
   * This is a reduce function specifically for datamodel arrays and objects.
   * It allows for returning normal values or datamodel instances.
   */
  reduce<U>(callback: (memo: U, item: T, index: number, arr: this) => U, initialValue?: U): U {
    let startIndex: number;
    let memo: U;

    // Allows for defining a starting value of the reduce
    if (initialValue !== undefined) {
      startIndex = 0;
      memo = this.refract(initialValue) as unknown as U;
    } else {
      startIndex = 1;
      memo = this.first as unknown as U;
    }

    // Sending each function call to the registry allows for passing datamodel
    // instances through the function return.
    for (let i = startIndex; i < this.length; i += 1) {
      const item = this._content[i];
      const result = callback(memo, item, i, this);
      memo = result === undefined ? result : (this.refract(result) as unknown as U);
    }

    return memo;
  }

  /**
   * Executes a provided function once for each element.
   */
  forEach(callback: (element: T, index: number) => void, thisArg?: unknown): void {
    this._content.forEach((item, index) => {
      callback.call(thisArg, item, index);
    });
  }

  // Fantasy Land

  /**
   * Returns an empty array element.
   */
  empty(): ArrayElement<T> {
    return new (this.constructor as new (content: unknown[]) => ArrayElement<T>)([]);
  }

  'fantasy-land/map'(transform: (element: T) => T): ArrayElement<T> {
    return new (this.constructor as new (content: T[]) => ArrayElement<T>)(this.map(transform));
  }

  'fantasy-land/chain'(transform: (element: T) => ArrayElement<T>): ArrayElement<T> {
    return this.map((element) => transform(element)).reduce(
      (a: ArrayElement<T>, b: ArrayElement<T>) => a.concat(b) as ArrayElement<T>,
      this.empty(),
    );
  }

  'fantasy-land/filter'(callback: (element: T) => boolean): ArrayElement<T> {
    return new (this.constructor as new (content: T[]) => ArrayElement<T>)(
      this._content.filter(callback),
    );
  }

  'fantasy-land/reduce'<U>(transform: (acc: U, element: T) => U, initialValue: U): U {
    return this._content.reduce(transform, initialValue);
  }
}

export default ArrayElement;
