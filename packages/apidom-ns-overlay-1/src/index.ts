export { default as mediaTypes, OverlayMediaTypes } from './media-types.ts';
export type { Format } from './media-types.ts';

export { default } from './namespace.ts';

export { default as refractorPluginReplaceEmptyElement } from './refractor/plugins/replace-empty-element.ts';

export {
  default as refract,
  refractOverlay,
  refractOverlay1,
  refractInfo,
  refractAction,
  refractComponents,
  refractReusableAction,
  refractReusableActionReference,
} from './refractor/index.ts';
export type { RefractorOptions, RefractorPlugin } from './refractor/index.ts';
export type { Toolbox } from './refractor/toolbox.ts';
export { default as specificationObj } from './refractor/specification.ts';

export {
  BaseSpecificationFallbackVisitor,
  BaseFixedFieldsFallbackVisitor,
  BaseMapFallbackVisitor,
} from './refractor/visitors/overlay-1/bases.ts';
export type {
  BaseSpecificationFallbackVisitorOptions,
  BaseFixedFieldsFallbackVisitorOptions,
  BaseMapFallbackVisitorOptions,
} from './refractor/visitors/overlay-1/bases.ts';

export { default as FixedFieldsVisitor } from './refractor/visitors/generics/FixedFieldsVisitor.ts';
export type {
  FixedFieldsVisitorOptions,
  SpecPath,
} from './refractor/visitors/generics/FixedFieldsVisitor.ts';
export { default as FallbackVisitor } from './refractor/visitors/FallbackVisitor.ts';
export type { FallbackVisitorOptions } from './refractor/visitors/FallbackVisitor.ts';
export { default as MapVisitor } from './refractor/visitors/generics/MapVisitor.ts';
export type { MapVisitorOptions } from './refractor/visitors/generics/MapVisitor.ts';
export { default as PatternedFieldsVisitor } from './refractor/visitors/generics/PatternedFieldsVisitor.ts';
export type { PatternedFieldsVisitorOptions } from './refractor/visitors/generics/PatternedFieldsVisitor.ts';
export { default as SpecificationExtensionVisitor } from './refractor/visitors/SpecificationExtensionVisitor.ts';
export type { SpecificationExtensionVisitorOptions } from './refractor/visitors/SpecificationExtensionVisitor.ts';
export { default as SpecificationVisitor } from './refractor/visitors/SpecificationVisitor.ts';
export type { SpecificationVisitorOptions } from './refractor/visitors/SpecificationVisitor.ts';
export { default as Visitor } from './refractor/visitors/Visitor.ts';
export type { VisitorOptions } from './refractor/visitors/Visitor.ts';

export type {
  default as OverlayVersionVisitor,
  OverlayVisitorOptions as OverlayVersionVisitorOptions,
} from './refractor/visitors/overlay-1/OverlayVisitor.ts';
export type {
  default as Overlay1Visitor,
  OverlayVisitorOptions as Overlay1VisitorOptions,
} from './refractor/visitors/overlay-1/index.ts';
export type {
  default as ActionsVisitor,
  ActionsVisitorOptions,
} from './refractor/visitors/overlay-1/ActionsVisitor.ts';
export type {
  default as InfoVisitor,
  InfoVisitorOptions,
} from './refractor/visitors/overlay-1/info/index.ts';
export type {
  default as InfoVersionVisitor,
  VersionVisitorOptions as InfoVersionVisitorOptions,
} from './refractor/visitors/overlay-1/info/VersionVisitor.ts';
export type {
  default as ActionVisitor,
  ActionVisitorOptions,
} from './refractor/visitors/overlay-1/action/index.ts';
export type {
  default as ComponentsVisitor,
  ComponentsVisitorOptions,
} from './refractor/visitors/overlay-1/components/index.ts';
export type {
  default as ComponentsActionsVisitor,
  ActionsVisitorOptions as ComponentsActionsVisitorOptions,
} from './refractor/visitors/overlay-1/components/ActionsVisitor.ts';
export type {
  default as ReusableActionVisitor,
  ReusableActionVisitorOptions,
} from './refractor/visitors/overlay-1/reusable-action/index.ts';
export type {
  default as ReusableActionReferenceVisitor,
  ReusableActionReferenceVisitorOptions,
} from './refractor/visitors/overlay-1/reusable-action-reference/index.ts';
export type {
  default as ReusableActionReference$RefVisitor,
  $RefVisitorOptions as ReusableActionReference$RefVisitorOptions,
} from './refractor/visitors/overlay-1/reusable-action-reference/$RefVisitor.ts';

export {
  isOverlayElement,
  isOverlay1Element,
  isInfoElement,
  isActionElement,
  isActionsElement,
  isComponentsElement,
  isComponentsActionsElement,
  isReusableActionElement,
  isReusableActionReferenceElement,
} from './predicates.ts';

export {
  isOverlaySpecificationExtension,
  isReusableActionReferenceLikeElement,
} from './refractor/predicates.ts';
export type { ReusableActionReferenceLikeElement } from './refractor/predicates.ts';

// Overlay 1.x.y elements
export {
  OverlayElement,
  Overlay1Element,
  InfoElement,
  ActionElement,
  ComponentsElement,
  ReusableActionElement,
  ReusableActionReferenceElement,
} from './refractor/inspect.ts';
export type { FixedField } from './refractor/inspect.ts';
// NCE types
export { default as ActionsElement } from './elements/nces/Actions.ts';
export { default as ComponentsActionsElement } from './elements/nces/ComponentsActions.ts';
