import { createPredicate } from '@speclynx/apidom-core';
import { isJSONSchemaElement } from '@speclynx/apidom-ns-json-schema-2020-12';

// Arazzo 1.0.1 elements
import ArazzoElement from './elements/Arazzo.ts';
import ArazzoSpecification1Element from './elements/ArazzoSpecification1.ts';
import ComponentsElement from './elements/Components.ts';
import CriterionElement from './elements/Criterion.ts';
import CriterionExpressionTypeElement from './elements/CriterionExpressionType.ts';
import FailureActionElement from './elements/FailureAction.ts';
import InfoElement from './elements/Info.ts';
import ParameterElement from './elements/Parameter.ts';
import PayloadReplacementElement from './elements/PayloadReplacement.ts';
import RequestBodyElement from './elements/RequestBody.ts';
import ReusableElement from './elements/Reusable.ts';
import SourceDescriptionElement from './elements/SourceDescription.ts';
import StepElement from './elements/Step.ts';
import SuccessActionElement from './elements/SuccessAction.ts';
import WorkflowElement from './elements/Workflow.ts';
// NCE types
import ComponentsFailureActionsElement from './elements/nces/ComponentsFailureActions.ts';
import ComponentsInputsElement from './elements/nces/ComponentsInputs.ts';
import ComponentsParametersElement from './elements/nces/ComponentsParameters.ts';
import ComponentsSuccessActionsElement from './elements/nces/ComponentsSuccessActions.ts';
import FailureActionCriteriaElement from './elements/nces/FailureActionCriteria.ts';
import RequestBodyReplacementsElement from './elements/nces/RequestBodyReplacements.ts';
import SourceDescriptionsElement from './elements/nces/SourceDescriptions.ts';
import StepDependsOnElement from './elements/nces/StepDependsOn.ts';
import StepOnFailureElement from './elements/nces/StepOnFailure.ts';
import StepOnSuccessElement from './elements/nces/StepOnSuccess.ts';
import StepOutputsElement from './elements/nces/StepOutputs.ts';
import StepParametersElement from './elements/nces/StepParameters.ts';
import StepSuccessCriteriaElement from './elements/nces/StepSuccessCriteria.ts';
import SuccessActionCriteriaElement from './elements/nces/SuccessActionCriteria.ts';
import WorkflowDependsOnElement from './elements/nces/WorkflowDependsOn.ts';
import WorkflowFailureActionsElement from './elements/nces/WorkflowFailureActions.ts';
import WorkflowOutputsElement from './elements/nces/WorkflowOutputs.ts';
import WorkflowParametersElement from './elements/nces/WorkflowParameters.ts';
import WorkflowsElement from './elements/nces/Workflows.ts';
import WorkflowStepsElement from './elements/nces/WorkflowSteps.ts';
import WorkflowSuccessActionsElement from './elements/nces/WorkflowSuccessActions.ts';

export { isJSONSchemaElement };

/**
 * @public
 */
export const isArazzoElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is ArazzoElement =>
      element instanceof ArazzoElement ||
      (hasBasicElementProps(element) &&
        isElementType('arazzo', element) &&
        primitiveEq('string', element));
  },
);

/**
 * @public
 */
export const isArazzoSpecification1Element = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ArazzoSpecification1Element =>
      element instanceof ArazzoSpecification1Element ||
      (hasBasicElementProps(element) &&
        isElementType('arazzoSpecification1', element) &&
        primitiveEq('object', element) &&
        hasClass('api', element) &&
        hasClass('arazzo', element));
  },
);

/**
 * @public
 */
export const isComponentsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is ComponentsElement =>
      element instanceof ComponentsElement ||
      (hasBasicElementProps(element) &&
        isElementType('components', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isCriterionElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is CriterionElement =>
      element instanceof CriterionElement ||
      (hasBasicElementProps(element) &&
        isElementType('criterion', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isCriterionExpressionTypeElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is CriterionExpressionTypeElement =>
      element instanceof CriterionExpressionTypeElement ||
      (hasBasicElementProps(element) &&
        isElementType('criterionExpressionType', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isFailureActionElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is FailureActionElement =>
      element instanceof FailureActionElement ||
      (hasBasicElementProps(element) &&
        isElementType('failureAction', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isInfoElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is InfoElement =>
      element instanceof InfoElement ||
      (hasBasicElementProps(element) &&
        isElementType('info', element) &&
        primitiveEq('object', element) &&
        hasClass('info', element));
  },
);

/**
 * @public
 */
export const isParameterElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is ParameterElement =>
      element instanceof ParameterElement ||
      (hasBasicElementProps(element) &&
        isElementType('parameter', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isPayloadReplacementElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is PayloadReplacementElement =>
      element instanceof PayloadReplacementElement ||
      (hasBasicElementProps(element) &&
        isElementType('payloadReplacement', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isRequestBodyElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is RequestBodyElement =>
      element instanceof RequestBodyElement ||
      (hasBasicElementProps(element) &&
        isElementType('requestBody', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isReusableElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ReusableElement =>
      element instanceof ReusableElement ||
      (hasBasicElementProps(element) &&
        isElementType('reusable', element) &&
        primitiveEq('object', element) &&
        hasClass('arazzo-reference', element));
  },
);

/**
 * @public
 */
export const isSourceDescriptionElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is SourceDescriptionElement =>
      element instanceof SourceDescriptionElement ||
      (hasBasicElementProps(element) &&
        isElementType('sourceDescription', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isStepElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is StepElement =>
      element instanceof StepElement ||
      (hasBasicElementProps(element) &&
        isElementType('step', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isSuccessActionElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is SuccessActionElement =>
      element instanceof SuccessActionElement ||
      (hasBasicElementProps(element) &&
        isElementType('successAction', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isWorkflowElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq }) => {
    return (element: unknown): element is WorkflowElement =>
      element instanceof WorkflowElement ||
      (hasBasicElementProps(element) &&
        isElementType('workflow', element) &&
        primitiveEq('object', element));
  },
);

/**
 * @public
 */
export const isComponentsFailureActionsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ComponentsFailureActionsElement =>
      element instanceof ComponentsFailureActionsElement ||
      (hasBasicElementProps(element) &&
        isElementType('object', element) &&
        primitiveEq('object', element) &&
        hasClass('components-failure-actions', element));
  },
);

/**
 * @public
 */
export const isComponentsInputsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ComponentsInputsElement =>
      element instanceof ComponentsInputsElement ||
      (hasBasicElementProps(element) &&
        isElementType('object', element) &&
        primitiveEq('object', element) &&
        hasClass('components-inputs', element));
  },
);

/**
 * @public
 */
export const isComponentsParametersElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ComponentsParametersElement =>
      element instanceof ComponentsParametersElement ||
      (hasBasicElementProps(element) &&
        isElementType('object', element) &&
        primitiveEq('object', element) &&
        hasClass('components-parameters', element) &&
        hasClass('parameters', element));
  },
);

/**
 * @public
 */
export const isComponentsSuccessActionsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is ComponentsSuccessActionsElement =>
      element instanceof ComponentsSuccessActionsElement ||
      (hasBasicElementProps(element) &&
        isElementType('object', element) &&
        primitiveEq('object', element) &&
        hasClass('components-success-actions', element));
  },
);

/**
 * @public
 */
export const isFailureActionCriteriaElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is FailureActionCriteriaElement =>
      element instanceof FailureActionCriteriaElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('failure-action-criteria', element) &&
        hasClass('criteria', element));
  },
);

/**
 * @public
 */
export const isRequestBodyReplacementsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is RequestBodyReplacementsElement =>
      element instanceof RequestBodyReplacementsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('request-body-replacements', element));
  },
);

/**
 * @public
 */
export const isSourceDescriptionsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is SourceDescriptionsElement =>
      element instanceof SourceDescriptionsElement ||
      (hasBasicElementProps(element) &&
        isElementType('sourceDescriptions', element) &&
        primitiveEq('array', element) &&
        hasClass('sourceDescriptions', element));
  },
);

/**
 * @public
 */
export const isStepDependsOnElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepDependsOnElement =>
      element instanceof StepDependsOnElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-depends-on', element));
  },
);

/**
 * @public
 */
export const isStepOnFailureElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepOnFailureElement =>
      element instanceof StepOnFailureElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-on-failure', element));
  },
);

/**
 * @public
 */
export const isStepOnSuccessElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepOnSuccessElement =>
      element instanceof StepOnSuccessElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-on-success', element));
  },
);

/**
 * @public
 */
export const isStepOutputsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepOutputsElement =>
      element instanceof StepOutputsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-outputs', element));
  },
);

/**
 * @public
 */
export const isStepParametersElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepParametersElement =>
      element instanceof StepParametersElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-parameters', element));
  },
);

/**
 * @public
 */
export const isStepSuccessCriteriaElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is StepSuccessCriteriaElement =>
      element instanceof StepSuccessCriteriaElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('step-success-criteria', element) &&
        hasClass('criteria', element));
  },
);

/**
 * @public
 */
export const isSuccessActionCriteriaElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is SuccessActionCriteriaElement =>
      element instanceof SuccessActionCriteriaElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('success-action-criteria', element) &&
        hasClass('criteria', element));
  },
);

/**
 * @public
 */
export const isWorkflowDependsOnElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowDependsOnElement =>
      element instanceof WorkflowDependsOnElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-depends-on', element));
  },
);

/**
 * @public
 */
export const isWorkflowFailureActionsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowFailureActionsElement =>
      element instanceof WorkflowFailureActionsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-failure-actions', element));
  },
);

/**
 * @public
 */
export const isWorkflowOutputsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowOutputsElement =>
      element instanceof WorkflowOutputsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-outputs', element));
  },
);

/**
 * @public
 */
export const isWorkflowParametersElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowParametersElement =>
      element instanceof WorkflowParametersElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-parameters', element) &&
        hasClass('parameters', element));
  },
);

/**
 * @public
 */
export const isWorkflowsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowsElement =>
      element instanceof WorkflowsElement ||
      (hasBasicElementProps(element) &&
        isElementType('workflows', element) &&
        primitiveEq('array', element) &&
        hasClass('workflows', element));
  },
);

/**
 * @public
 */
export const isWorkflowStepsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowStepsElement =>
      element instanceof WorkflowStepsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-steps', element));
  },
);

/**
 * @public
 */
export const isWorkflowSuccessActionsElement = createPredicate(
  ({ hasBasicElementProps, isElementType, primitiveEq, hasClass }) => {
    return (element: unknown): element is WorkflowSuccessActionsElement =>
      element instanceof WorkflowSuccessActionsElement ||
      (hasBasicElementProps(element) &&
        isElementType('array', element) &&
        primitiveEq('array', element) &&
        hasClass('workflow-success-actions', element));
  },
);
