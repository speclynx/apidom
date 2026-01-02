export { default as mediaTypes, JSONSchemaDraft6MediaTypes } from './media-types.ts';
export type { Format } from './media-types.ts';

export { default } from './namespace.ts';

export { default as refractorPluginReplaceEmptyElement } from './refractor/plugins/replace-empty-element.ts';

export {
  default as refract,
  refractJSONSchema,
  refractLinkDescription,
} from './refractor/index.ts';
export type { RefractorOptions, RefractorPlugin } from './refractor/index.ts';
export type { Toolbox } from './refractor/toolbox.ts';
export { default as specificationObj } from './refractor/specification.ts';

export {
  isJSONReferenceElement,
  isJSONSchemaElement,
  isLinkDescriptionElement,
  isMediaElement,
} from './predicates.ts';

export {
  isJSONReferenceLikeElement,
  SpecificationVisitor,
  FallbackVisitor,
  FixedFieldsVisitor,
  PatternedFieldsVisitor,
  MapVisitor,
  AlternatingVisitor,
  ParentSchemaAwareVisitor,
  Visitor,
} from '@speclynx/apidom-ns-json-schema-draft-4';
export type {
  SpecificationVisitorOptions,
  FallbackVisitorOptions,
  FixedFieldsVisitorOptions,
  PatternedFieldsVisitorOptions,
  MapVisitorOptions,
  AlternatingVisitorOptions,
  ParentSchemaAwareVisitorOptions,
  VisitorOptions,
  AllOfVisitor,
  AllOfVisitorOptions,
  AnyOfVisitor,
  AnyOfVisitorOptions,
  DefinitionsVisitor,
  DefinitionsVisitorOptions,
  DependenciesVisitor,
  DependenciesVisitorOptions,
  OneOfVisitor,
  OneOfVisitorOptions,
  PatternPropertiesVisitor,
  PatternPropertiesVisitorOptions,
  PropertiesVisitor,
  PropertiesVisitorOptions,
  SchemaOrReferenceVisitor,
  SchemaOrReferenceVisitorOptions,
  SpecPath,
  ItemsVisitor as JSONSchemaDraft4ItemsVisitor,
} from '@speclynx/apidom-ns-json-schema-draft-4';

export { default as LinkDescriptionVisitor } from './refractor/visitors/json-schema/link-description/index.ts';
export type { LinkDescriptionVisitorOptions } from './refractor/visitors/json-schema/link-description/index.ts';
export { default as JSONSchemaVisitor } from './refractor/visitors/json-schema/index.ts';
export type { JSONSchemaVisitorOptions } from './refractor/visitors/json-schema/index.ts';
export type {
  default as ExamplesVisitor,
  ExamplesVisitorOptions,
} from './refractor/visitors/json-schema/ExamplesVisitor.ts';
export { default as ItemsVisitor } from './refractor/visitors/json-schema/ItemsVisitor.ts';
export type { ItemsVisitorOptions } from './refractor/visitors/json-schema/ItemsVisitor.ts';

export { keyMap, getNodeType } from './traversal/visitor.ts';

/**
 * JSON Schema Draft 6 specification elements.
 */
export {
  JSONSchemaElement,
  JSONReferenceElement,
  MediaElement,
  LinkDescriptionElement,
} from './refractor/inspect.ts';
export type { FixedField } from './refractor/inspect.ts';
