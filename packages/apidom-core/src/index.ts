export { dispatchPluginsSync as dispatchRefractorPlugins } from './refractor/plugins/dispatcher/index.ts';
export type {
  DispatchPluginsSync,
  DispatchPluginsAsync,
  DispatchPluginsOptions,
} from './refractor/plugins/dispatcher/index.ts';

export { default as createToolbox } from './refractor/toolbox.ts';
export type { Toolbox, Predicates } from './refractor/toolbox.ts';

export { default as refractorPluginElementIdentity } from './refractor/plugins/element-identity.ts';
export { default as refractorPluginSemanticElementIdentity } from './refractor/plugins/semantic-element-identity.ts';

export { default as MediaTypes } from './media-types.ts';

export { transclude, default as Transcluder } from './transcluder/index.ts';

export { resolveSpecification, type ResolvedSpecification } from './specification.ts';

export { defaultIdentityManager, IdentityManager } from './identity/index.ts';
export { default as ElementIdentityError } from './identity/errors/ElementIdentityError.ts';
export type { ElementIdentityErrorOptions } from './identity/errors/ElementIdentityError.ts';

/**
 * Transforms data to an Element from a particular namespace.
 */
export { default as from } from './transformers/from.ts';

/**
 * Transforms the ApiDOM into JavaScript POJO.
 * This POJO would be the result of interpreting the ApiDOM
 * into JavaScript structure.
 */
export { default as toValue } from './transformers/serializers/value.ts';

/**
 * Transforms the ApiDOM into JSON string.
 */
export { default as toJSON } from './transformers/serializers/json.ts';

/**
 * Transforms the ApiDOM into YAML string.
 */
export {
  default as toYAML,
  type YamlSerializerOptions,
} from './transformers/serializers/yaml-1-2.ts';

/**
 * Creates a refract representation of an Element.
 * https://github.com/refractproject/refract-spec
 */
export { default as dehydrate } from './transformers/dehydrate.ts';

/**
 * Create a refracted string representation of an Element.
 */
export { default as toString } from './transformers/to-string.ts';

export { default as sexprs } from './transformers/sexprs.ts';

export { default as deepmerge } from './merge/deepmerge.ts';
export type {
  DeepMergeUserOptions,
  ObjectOrArrayElement,
  AnyElement,
  DeepMerge,
  DeepMergeOptions,
  ArrayElementMerge as DeepMergeArrayElementMerge,
  ObjectElementMerge as DeepMergeObjectElementMerge,
  CustomMerge as DeepMergeCustomMerge,
  CustomMetaMerge as DeepMergeCustomMetaMerge,
  CustomAttributesMerge as DeepMergeCustomAttributesMerge,
} from './merge/deepmerge.ts';
export { default as mergeRight } from './merge/merge-right.ts';
export type { MergeRightOptions } from './merge/merge-right.ts';
export { default as mergeLeft } from './merge/merge-left.ts';
export type { MergeRightOptions as MergeLeftOptions } from './merge/merge-right.ts';
