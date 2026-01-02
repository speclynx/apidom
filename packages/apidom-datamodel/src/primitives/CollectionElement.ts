import Element, { type Meta, type Attributes } from './Element.ts';
import type ArrayElement from './ArrayElement.ts';

/**
 * Condition function for finding elements.
 * @public
 */
export type FindCondition = (
  item: Element,
  keyOrIndex: Element | number,
  member?: Element,
) => boolean;

/**
 * Options for finding elements.
 * @public
 */
export interface FindOptions {
  recursive?: boolean;
  results?: Element[];
}

/**
 * CollectionElement is an abstract base class for collection-like elements.
 * Both ArrayElement and ObjectElement extend this class.
 *
 * This class contains the shared functionality between arrays and objects,
 * while keeping the conflicting methods (get, set, remove, map, filter, etc.)
 * in the respective subclasses.
 *
 * @remarks
 * This is primarily an implementation detail. Use ArrayElement or ObjectElement directly.
 *
 * @typeParam T - The element type contained in the collection, defaults to Element
 * @public
 */
abstract class CollectionElement<T extends Element = Element> extends Element {
  declare protected _content: T[];

  constructor(content?: unknown[], meta?: Meta, attributes?: Attributes) {
    super(content || [], meta, attributes);
  }

  /**
   * Returns the length of the collection.
   */
  get length(): number {
    return this._content.length;
  }

  /**
   * Returns whether the collection is empty.
   */
  get isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Return the first item in the collection.
   */
  get first(): T | undefined {
    return this._content[0];
  }

  /**
   * Return the second item in the collection.
   */
  get second(): T | undefined {
    return this._content[1];
  }

  /**
   * Return the last item in the collection.
   */
  get last(): T | undefined {
    return this._content.at(-1);
  }

  /**
   * Adds the given elements to the end of the collection.
   */
  push(...values: unknown[]): this {
    for (const value of values) {
      this._content.push(this.refract(value) as T);
    }
    return this;
  }

  /**
   * Removes the first element from the collection.
   */
  shift(): T | undefined {
    return this._content.shift();
  }

  /**
   * Adds the given element to the beginning of the collection.
   */
  unshift(value: unknown): void {
    this._content.unshift(this.refract(value) as T);
  }

  /**
   * Looks for matching children using deep equality.
   */
  includes(value: unknown): boolean {
    return this._content.some((element) => element.equals(value));
  }

  /**
   * Recursively search all descendants using a condition function.
   */
  findElements(condition: FindCondition, givenOptions?: FindOptions): Element[] {
    const options = givenOptions || {};
    const recursive = !!options.recursive;
    const results = options.results === undefined ? [] : options.results;

    for (let i = 0; i < this._content.length; i += 1) {
      const item = this._content[i];

      // We use duck-typing here to support any registered class that
      // may contain other elements.
      type FindElementsFn = (condition: FindCondition, options?: FindOptions) => Element[];
      const itemWithFindElements = item as unknown as { findElements?: FindElementsFn };
      if (recursive && typeof itemWithFindElements.findElements === 'function') {
        itemWithFindElements.findElements(condition, {
          results,
          recursive,
        });
      }

      if (condition(item, i, undefined)) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Recursively search all descendants using a condition function.
   */
  find(condition: FindCondition): ArrayElement {
    const results = this.findElements(condition, { recursive: true });
    return new this.ArrayElement(results);
  }

  /**
   * Find elements by their element type name.
   */
  findByElement(element: string): ArrayElement {
    return this.find((item) => item.element === element);
  }

  /**
   * Find elements by class name.
   */
  findByClass(className: string): ArrayElement {
    return this.find((item) => {
      const classes = item.classes as unknown as { includes?: (value: unknown) => boolean };
      return typeof classes.includes === 'function' && classes.includes(className);
    });
  }

  /**
   * Search the tree recursively and find the element with the matching ID.
   */
  getById(id: string): Element | undefined {
    return this.find((item) => item.id.toValue() === id).first;
  }

  /**
   * Returns an empty collection element.
   */
  abstract empty(): this;

  /**
   * Concatenates two collection elements.
   */
  concat(other: CollectionElement<T>): this {
    const Ctor = this.constructor as new (content: T[]) => this;
    return new Ctor(this._content.concat(other._content));
  }

  // Iterator support
  [Symbol.iterator](): IterableIterator<T> {
    return this._content[Symbol.iterator]();
  }
}

export default CollectionElement;
