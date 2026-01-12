export { default as mediaTypes, JSONSchema202012MediaTypes } from './media-types.ts';
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

export { isJSONSchemaElement, isLinkDescriptionElement } from './predicates.ts';

export {
  SpecificationVisitor,
  FallbackVisitor,
  FixedFieldsVisitor,
  PatternedFieldsVisitor,
  MapVisitor,
  AlternatingVisitor,
  ParentSchemaAwareVisitor,
  Visitor,
} from '@speclynx/apidom-ns-json-schema-2019-09';
export type {
  SpecificationVisitorOptions,
  FallbackVisitorOptions,
  FixedFieldsVisitorOptions,
  PatternedFieldsVisitorOptions,
  MapVisitorOptions,
  AlternatingVisitorOptions,
  ParentSchemaAwareVisitorOptions,
  VisitorOptions,
  SpecPath,
} from '@speclynx/apidom-ns-json-schema-2019-09';

export { default as JSONSchemaVisitor } from './refractor/visitors/json-schema/index.ts';
export type { JSONSchemaVisitorOptions } from './refractor/visitors/json-schema/index.ts';
export { default as LinkDescriptionVisitor } from './refractor/visitors/json-schema/link-description/index.ts';
export type { LinkDescriptionVisitorOptions } from './refractor/visitors/json-schema/link-description/index.ts';
export { $defsVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { $defsVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { $refVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { $refVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { $vocabularyVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { $vocabularyVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { AllOfVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { AllOfVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { AnyOfVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { AnyOfVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { DependentRequiredVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { DependentRequiredVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { DependentSchemasVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { DependentSchemasVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { ItemsVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { ItemsVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { OneOfVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { OneOfVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { PatternPropertiesVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { PatternPropertiesVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { PropertiesVisitor } from '@speclynx/apidom-ns-json-schema-2019-09';
export type { PropertiesVisitorOptions } from '@speclynx/apidom-ns-json-schema-2019-09';
export { default as PrefixItemsVisitor } from './refractor/visitors/json-schema/PrefixItemsVisitor.ts';
export type { PrefixItemsVisitorOptions } from './refractor/visitors/json-schema/PrefixItemsVisitor.ts';

export {
  BaseSchemaArrayVisitor,
  BaseSchemaMapVisitor,
} from '@speclynx/apidom-ns-json-schema-2019-09';
export type {
  BaseSchemaArrayVisitorOptions,
  BaseSchemaMapVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2019-09';

/**
 * JSON Schema 2020-12 specification elements.
 */
export { JSONSchemaElement, LinkDescriptionElement } from './refractor/inspect.ts';
export type { FixedField } from './refractor/inspect.ts';
