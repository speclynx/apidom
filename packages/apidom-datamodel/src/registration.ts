import Element from './primitives/Element.ts';
import CollectionElement from './primitives/CollectionElement.ts';
import NullElement from './primitives/NullElement.ts';
import StringElement from './primitives/StringElement.ts';
import NumberElement from './primitives/NumberElement.ts';
import BooleanElement from './primitives/BooleanElement.ts';
import ArrayElement from './primitives/ArrayElement.ts';
import MemberElement from './primitives/MemberElement.ts';
import ObjectElement from './primitives/ObjectElement.ts';
import LinkElement from './elements/LinkElement.ts';
import RefElement from './elements/RefElement.ts';
import AnnotationElement from './elements/Annotation.ts';
import CommentElement from './elements/Comment.ts';
import ParseResultElement from './elements/ParseResult.ts';
import SourceMapElement from './elements/SourceMap.ts';
import ObjectSlice from './ObjectSlice.ts';
import KeyValuePair from './KeyValuePair.ts';

/**
 * Refracts an array item to ApiDOM element.
 * Converts undefined to NullElement (aligned with JSON.stringify behavior).
 */
function refractArrayItem(value: unknown): Element {
  if (value === undefined) {
    return new NullElement();
  }
  return refract(value);
}

/**
 * Refracts a JSON type to ApiDOM elements.
 * @public
 */
function refract(value: unknown): Element {
  if (value instanceof Element) {
    return value;
  }

  if (typeof value === 'string') {
    return new StringElement(value);
  }

  if (typeof value === 'number') {
    return new NumberElement(value);
  }

  if (typeof value === 'boolean') {
    return new BooleanElement(value);
  }

  if (value === null) {
    return new NullElement();
  }

  if (Array.isArray(value)) {
    return new ArrayElement(value.map(refractArrayItem));
  }

  if (typeof value === 'object') {
    return new ObjectElement(value as Record<string, unknown>);
  }

  throw new Error(`Cannot refract value of type ${typeof value}`);
}

// Set up prototype assignments for circular dependency resolution.
// These allow Element instances to create ObjectElement, MemberElement, RefElement
// without importing them directly (which would cause circular imports).
// Using 'declare' in the class definitions enables type-safe access to these properties.
Element.prototype.ObjectElement = ObjectElement;
Element.prototype.ArrayElement = ArrayElement;
Element.prototype.RefElement = RefElement;
Element.prototype.MemberElement = MemberElement;
Element.prototype.refract = refract;

/**
 * Contains all of the element classes, and related structures and methods
 * for handling with element instances.
 */
export {
  Element,
  CollectionElement,
  NullElement,
  StringElement,
  NumberElement,
  BooleanElement,
  ArrayElement,
  MemberElement,
  ObjectElement,
  LinkElement,
  RefElement,
  AnnotationElement,
  CommentElement,
  ParseResultElement,
  SourceMapElement,
  refract,
  ObjectSlice,
  KeyValuePair,
};

// Re-export types from element classes
export type { FindCondition, FindOptions } from './primitives/CollectionElement.ts';
export type { ObjectElementCallback } from './primitives/ObjectElement.ts';
export type { ObjectSliceCallback, ObjectSliceForEachCallback } from './ObjectSlice.ts';
export type { Position, PositionRange } from './elements/SourceMap.ts';
