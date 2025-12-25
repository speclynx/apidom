export { default as Namespace } from './Namespace.ts';
export { default as KeyValuePair } from './KeyValuePair.ts';

// Re-export elements directly to preserve JSDoc
export {
  ObjectSlice,
  Element,
  CollectionElement,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
  ArrayElement,
  ObjectElement,
  MemberElement,
  RefElement,
  LinkElement,
  refract,
} from './registration.ts';

export { default as JSONSerialiser } from './serialisers/JSONSerialiser.ts';

// Re-export types - essential public API
export type { Meta, Attributes, ElementContent } from './primitives/Element.ts';
export type { PrimitiveValue } from './types.ts';

// Re-export types - for advanced users extending the library
export type { ElementClass, NamespaceOptions, NamespacePlugin } from './Namespace.ts';
export type { SerializedElement, RefractDocument } from './serialisers/JSONSerialiser.ts';

// Re-export types - used in public method signatures
export type { DetectionTest, DetectionEntry, ElementsMap } from './Namespace.ts';
export type { ObjectSliceCallback, ObjectSliceForEachCallback } from './ObjectSlice.ts';
export type { FindCondition, FindOptions } from './primitives/CollectionElement.ts';
export type { Cloneable, ToValue, Equatable, Freezable } from './types.ts';
export type { ObjectElementCallback } from './primitives/ObjectElement.ts';
export type { SerializedContent, SerializedKeyValuePair } from './serialisers/JSONSerialiser.ts';
