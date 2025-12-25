/**
 * Shared type definitions for ApiDOM data model.
 * These types are used across multiple modules to ensure consistency.
 */

import type ObjectElement from './primitives/ObjectElement.ts';

/**
 * Metadata associated with an element.
 * Can be a plain object or an ObjectElement.
 * Common meta properties include: id, classes, title, description, links.
 * @public
 */
export type Meta = Record<string, unknown> | ObjectElement;

/**
 * Attributes associated with an element.
 * Can be a plain object or an ObjectElement.
 * Attributes are element-specific properties beyond the standard meta.
 * @public
 */
export type Attributes = Record<string, unknown> | ObjectElement;

/**
 * Primitive JavaScript values that can be element content.
 * @public
 */
export type PrimitiveValue = string | number | boolean | null | undefined;

/**
 * Predicate function for filtering/matching elements.
 * @public
 */
export type ElementPredicate<T = unknown> = (element: T) => boolean;

/**
 * Callback for array-style iteration (element, index, array).
 * @public
 */
export type ArrayCallback<T, U> = (element: T, index: number, array: T[]) => U;

/**
 * Callback for object-style iteration (value, key, member).
 * @public
 */
export type ObjectCallback<V, K, M, U> = (value: V, key: K, member: M) => U;

/**
 * Type for cloneable objects.
 * @public
 */
export interface Cloneable<T> {
  clone(): T;
}

/**
 * Type for objects that can convert to JavaScript values.
 * @public
 */
export interface ToValue<T = unknown> {
  toValue(): T;
}

/**
 * Type for objects that support deep equality comparison.
 * @public
 */
export interface Equatable {
  equals(value: unknown): boolean;
}

/**
 * Type for freezable objects (immutable after freeze).
 * @public
 */
export interface Freezable {
  freeze(): void;
  readonly isFrozen: boolean;
}
