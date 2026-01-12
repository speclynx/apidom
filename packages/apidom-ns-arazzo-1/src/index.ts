export { default as mediaTypes, ArazzoMediaTypes } from './media-types.ts';
export type { Format } from './media-types.ts';

export { default } from './namespace.ts';

export { default as refractorPluginReplaceEmptyElement } from './refractor/plugins/replace-empty-element.ts';

export {
  default as refract,
  refractArazzo,
  refractArazzoSpecification1,
  refractComponents,
  refractCriterion,
  refractCriterionExpressionType,
  refractFailureAction,
  refractInfo,
  refractJSONSchema,
  refractParameter,
  refractPayloadReplacement,
  refractRequestBody,
  refractReusable,
  refractSourceDescription,
  refractStep,
  refractSuccessAction,
  refractWorkflow,
} from './refractor/index.ts';
export type { RefractorOptions, RefractorPlugin } from './refractor/index.ts';
export type { Toolbox } from './refractor/toolbox.ts';
export { default as specificationObj } from './refractor/specification.ts';

export {
  BaseSpecificationFallbackVisitor,
  BaseFixedFieldsFallbackVisitor,
  BaseMapFallbackVisitor,
} from './refractor/visitors/arazzo-1/bases.ts';
export type {
  BaseSpecificationFallbackVisitorOptions,
  BaseFixedFieldsFallbackVisitorOptions,
  BaseMapFallbackVisitorOptions,
} from './refractor/visitors/arazzo-1/bases.ts';

export { default as FixedFieldsVisitor } from './refractor/visitors/generics/FixedFieldsVisitor.ts';
export type {
  FixedFieldsVisitorOptions,
  SpecPath,
} from './refractor/visitors/generics/FixedFieldsVisitor.ts';
export { default as MapVisitor } from './refractor/visitors/generics/MapVisitor.ts';
export type { MapVisitorOptions } from './refractor/visitors/generics/MapVisitor.ts';
export { default as PatternedFieldsVisitor } from './refractor/visitors/generics/PatternedFieldsVisitor.ts';
export type { PatternedFieldsVisitorOptions } from './refractor/visitors/generics/PatternedFieldsVisitor.ts';
export { default as FallbackVisitor } from './refractor/visitors/FallbackVisitor.ts';
export type { FallbackVisitorOptions } from './refractor/visitors/FallbackVisitor.ts';
export { default as SpecificationExtensionVisitor } from './refractor/visitors/SpecificationExtensionVisitor.ts';
export type { SpecificationExtensionVisitorOptions } from './refractor/visitors/SpecificationExtensionVisitor.ts';
export { default as SpecificationVisitor } from './refractor/visitors/SpecificationVisitor.ts';
export type { SpecificationVisitorOptions } from './refractor/visitors/SpecificationVisitor.ts';
export { default as Visitor } from './refractor/visitors/Visitor.ts';
export type { VisitorOptions } from './refractor/visitors/Visitor.ts';

export type {
  default as ArazzoVisitor,
  ArazzoVisitorOptions,
} from './refractor/visitors/arazzo-1/ArazzoVisitor.ts';
export type {
  default as ComponentsVisitor,
  ComponentsVisitorOptions,
} from './refractor/visitors/arazzo-1/components/index.ts';
export type {
  default as ComponentsFailureActionsVisitor,
  FailureActionsVisitorOptions as ComponentsFailureActionsVisitorOptions,
} from './refractor/visitors/arazzo-1/components/FailureActionsVisitor.ts';
export type {
  default as ComponentsInputsVisitor,
  InputsVisitorOptions as ComponentsInputsVisitorOptions,
} from './refractor/visitors/arazzo-1/components/InputsVisitor.ts';
export type {
  default as ComponentsParametersVisitor,
  ParametersVisitorOptions as ComponentsParametersVisitorOptions,
} from './refractor/visitors/arazzo-1/components/ParametersVisitor.ts';
export type {
  default as ComponentsSuccessActionsVisitor,
  SuccessActionsVisitorOptions as ComponentsSuccessActionsVisitorOptions,
} from './refractor/visitors/arazzo-1/components/SuccessActionsVisitor.ts';
export type {
  default as CriterionVisitor,
  CriterionVisitorOptions,
} from './refractor/visitors/arazzo-1/criterion/index.ts';
export type {
  default as CriterionTypeVisitor,
  TypeVisitorOptions as CriterionTypeVisitorOptions,
} from './refractor/visitors/arazzo-1/criterion/TypeVisitor.ts';
export type {
  default as CriterionExpressionTypeVisitor,
  CriterionExpressionTypeVisitorOptions,
} from './refractor/visitors/arazzo-1/criterion-expression-type/index.ts';
export type {
  default as CriterionExpressionTypeVersionVisitor,
  VersionVisitorOptions as CriterionExpressionTypeVersionVisitorOptions,
} from './refractor/visitors/arazzo-1/criterion-expression-type/VersionVisitor.ts';
export type {
  default as FailureActionVisitor,
  FailureActionVisitorOptions,
} from './refractor/visitors/arazzo-1/failure-action/index.ts';
export type {
  default as FailureActionCriteriaVisitor,
  CriteriaVisitorOptions as FailureActionCriteriaVisitorOptions,
} from './refractor/visitors/arazzo-1/failure-action/CriteriaVisitor.ts';
export type {
  default as InfoVisitor,
  InfoVisitorOptions,
} from './refractor/visitors/arazzo-1/info/index.ts';
export type {
  default as InfoVersionVisitor,
  VersionVisitorOptions as InfoVersionVisitorOptions,
} from './refractor/visitors/arazzo-1/info/VersionVisitor.ts';
export type {
  default as JSONSchemaVisitor,
  JSONSchemaVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';
export type {
  default as ArazzoJSONSchemaVisitor,
  JSONSchemaVisitorOptions as ArazzoJSONSchemaVisitorOptions,
} from './refractor/visitors/arazzo-1/json-schema/index.ts';
export type {
  default as ParameterVisitor,
  ParameterVisitorOptions,
} from './refractor/visitors/arazzo-1/parameter/index.ts';
export type {
  default as PayloadReplacementVisitor,
  PayloadReplacementVisitorOptions,
} from './refractor/visitors/arazzo-1/payload-replacement/index.ts';
export type {
  default as RequestBodyVisitor,
  RequestBodyVisitorOptions,
} from './refractor/visitors/arazzo-1/request-body/index.ts';
export type {
  default as RequestBodyReplacementsVisitor,
  ReplacementsVisitorOptions as RequestBodyReplacementsVisitorOptions,
} from './refractor/visitors/arazzo-1/request-body/Replacements.ts';
export type {
  default as ReusableVisitor,
  ReferenceVisitorOptions as ReusableVisitorOptions,
} from './refractor/visitors/arazzo-1/reusable/index.ts';
export type {
  default as ReusableReferenceVisitor,
  $RefVisitorOptions as ReusableReferenceVisitorOptions,
} from './refractor/visitors/arazzo-1/reusable/ReferenceVisitor.ts';
export type {
  default as SourceDescriptionsVisitor,
  SourceDescriptionVisitorOptions,
} from './refractor/visitors/arazzo-1/source-description/index.ts';
export type {
  default as SourceDescriptionsUrlVisitor,
  UrlVisitorOptions as SourceDescriptionsUrlVisitorOptions,
} from './refractor/visitors/arazzo-1/source-description/UrlVisitor.ts';
export type {
  default as StepsVisitor,
  StepVisitorOptions,
} from './refractor/visitors/arazzo-1/step/index.ts';
export type {
  default as StepOnFailureVisitor,
  OnFailureVisitorOptions as StepOnFailureVisitorOptions,
} from './refractor/visitors/arazzo-1/step/OnFailureVisitor.ts';
export type {
  default as StepOnSuccessVisitor,
  OnSuccessVisitorOptions as StepOnSuccessVisitorOptions,
} from './refractor/visitors/arazzo-1/step/OnSuccessVisitor.ts';
export type {
  default as StepOutputsVisitor,
  OutputsVisitorOptions as StepOutputsVisitorOptions,
} from './refractor/visitors/arazzo-1/step/OutputsVisitor.ts';
export type {
  default as StepParametersVisitor,
  ParametersVisitorOptions as StepParametersVisitorOptions,
} from './refractor/visitors/arazzo-1/step/ParametersVisitor.ts';
export type {
  default as StepSuccessCriteriaVisitor,
  SuccessCriteriaVisitorOptions as StepSuccessCriteriaVisitorOptions,
} from './refractor/visitors/arazzo-1/step/SuccessCriteriaVisitor.ts';
export type {
  default as SuccessActionVisitor,
  SuccessActionVisitorOptions,
} from './refractor/visitors/arazzo-1/success-action/index.ts';
export type {
  default as SuccessActionCriteriaVisitor,
  CriteriaVisitorOptions as SuccessActionCriteriaVisitorOptions,
} from './refractor/visitors/arazzo-1/success-action/CriteriaVisitor.ts';
export type {
  default as WorkflowVisitor,
  WorkflowVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/index.ts';
export type {
  default as WorkflowDependsOnVisitor,
  WorkflowDependsOnVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/DependsOnVisitor.ts';
export type {
  default as WorkflowFailureActionsVisitor,
  FailureActionsVisitorOptions as WorkflowFailureActionsVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/FailureActionsVisitor.ts';
export type {
  default as WorkflowParametersVisitor,
  ParametersVisitorOptions as WorkflowParametersVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/ParametersVisitor.ts';
export type {
  default as WorkflowSuccessActionsVisitor,
  SuccessActionsVisitorOptions as WorkflowSuccessActionsVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/SuccessActionsVisitor.ts';
export type {
  default as WorkflowOutputsVisitor,
  OutputsVisitorOptions as WorkflowOutputsVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/OutputsVisitor.ts';
export type {
  default as ArazzoStepsVisitor,
  StepsVisitorOptions as ArazzoStepsVisitorOptions,
} from './refractor/visitors/arazzo-1/workflow/StepsVisitor.ts';
export type {
  default as ArazzoSpecificationVisitor,
  ArazzoSpecificationVisitorOptions,
} from './refractor/visitors/arazzo-1/index.ts';
export type {
  default as ArazzoSourceDescriptionsVisitor,
  SourceDescriptionsVisitorOptions as ArazzoSourceDescriptionsVisitorOptions,
} from './refractor/visitors/arazzo-1/SourceDescriptionsVisitor.ts';
export type {
  default as WorkflowsVisitor,
  WorkflowsVisitorOptions,
} from './refractor/visitors/arazzo-1/WorkflowsVisitor.ts';

export {
  isArazzoElement,
  isArazzoSpecification1Element,
  isComponentsElement,
  isComponentsFailureActionsElement,
  isComponentsInputsElement,
  isComponentsParametersElement,
  isComponentsSuccessActionsElement,
  isCriterionElement,
  isCriterionExpressionTypeElement,
  isFailureActionElement,
  isFailureActionCriteriaElement,
  isInfoElement,
  isJSONSchemaElement,
  isParameterElement,
  isPayloadReplacementElement,
  isRequestBodyElement,
  isRequestBodyReplacementsElement,
  isReusableElement,
  isSourceDescriptionElement,
  isSourceDescriptionsElement,
  isStepElement,
  isStepDependsOnElement,
  isStepOnFailureElement,
  isStepOnSuccessElement,
  isStepOutputsElement,
  isStepParametersElement,
  isStepSuccessCriteriaElement,
  isSuccessActionElement,
  isSuccessActionCriteriaElement,
  isWorkflowElement,
  isWorkflowDependsOnElement,
  isWorkflowFailureActionsElement,
  isWorkflowOutputsElement,
  isWorkflowParametersElement,
  isWorkflowsElement,
  isWorkflowStepsElement,
  isWorkflowSuccessActionsElement,
} from './predicates.ts';

export { isArazzoSpecificationExtension } from './refractor/predicates.ts';

// Arazzo 1.0.1 elements
export {
  ArazzoElement,
  ArazzoSpecification1Element,
  ComponentsElement,
  CriterionElement,
  CriterionExpressionTypeElement,
  FailureActionElement,
  InfoElement,
  JSONSchemaElement,
  ParameterElement,
  PayloadReplacementElement,
  RequestBodyElement,
  ReusableElement,
  SourceDescriptionElement,
  StepElement,
  SuccessActionElement,
  WorkflowElement,
} from './refractor/inspect.ts';
export type { FixedField } from './refractor/inspect.ts';
// NCE types
export { default as ComponentsFailureActionsElement } from './elements/nces/ComponentsFailureActions.ts';
export { default as ComponentsInputsElement } from './elements/nces/ComponentsInputs.ts';
export { default as ComponentsParametersElement } from './elements/nces/ComponentsParameters.ts';
export { default as ComponentsSuccessActionsElement } from './elements/nces/ComponentsSuccessActions.ts';
export { default as FailureActionCriteriaElement } from './elements/nces/FailureActionCriteria.ts';
export { default as RequestBodyReplacementsElement } from './elements/nces/RequestBodyReplacements.ts';
export { default as SourceDescriptionsElement } from './elements/nces/SourceDescriptions.ts';
export { default as StepDependsOnElement } from './elements/nces/StepDependsOn.ts';
export { default as StepOnFailureElement } from './elements/nces/StepOnFailure.ts';
export { default as StepOnSuccessElement } from './elements/nces/StepOnSuccess.ts';
export { default as StepOutputsElement } from './elements/nces/StepOutputs.ts';
export { default as StepParametersElement } from './elements/nces/StepParameters.ts';
export { default as StepSuccessCriteriaElement } from './elements/nces/StepSuccessCriteria.ts';
export { default as SuccessActionCriteriaElement } from './elements/nces/SuccessActionCriteria.ts';
export { default as WorkflowDependsOnElement } from './elements/nces/WorkflowDependsOn.ts';
export { default as WorkflowFailureActionsElement } from './elements/nces/WorkflowFailureActions.ts';
export { default as WorkflowOutputsElement } from './elements/nces/WorkflowOutputs.ts';
export { default as WorkflowParametersElement } from './elements/nces/WorkflowParameters.ts';
export { default as WorkflowsElement } from './elements/nces/Workflows.ts';
export { default as WorkflowStepsElement } from './elements/nces/WorkflowSteps.ts';
export { default as WorkflowSuccessActionsElement } from './elements/nces/WorkflowSuccessActions.ts';
