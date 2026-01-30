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

export {
  isJSONSchemaElement,
  isBooleanJSONSchemaElement,
} from '@speclynx/apidom-ns-json-schema-2020-12';

/**
 * @public
 */
export const isArazzoElement = (element: unknown): element is ArazzoElement =>
  element instanceof ArazzoElement;

/**
 * @public
 */
export const isArazzoSpecification1Element = (
  element: unknown,
): element is ArazzoSpecification1Element => element instanceof ArazzoSpecification1Element;

/**
 * @public
 */
export const isComponentsElement = (element: unknown): element is ComponentsElement =>
  element instanceof ComponentsElement;

/**
 * @public
 */
export const isCriterionElement = (element: unknown): element is CriterionElement =>
  element instanceof CriterionElement;

/**
 * @public
 */
export const isCriterionExpressionTypeElement = (
  element: unknown,
): element is CriterionExpressionTypeElement => element instanceof CriterionExpressionTypeElement;

/**
 * @public
 */
export const isFailureActionElement = (element: unknown): element is FailureActionElement =>
  element instanceof FailureActionElement;

/**
 * @public
 */
export const isInfoElement = (element: unknown): element is InfoElement =>
  element instanceof InfoElement;

/**
 * @public
 */
export const isParameterElement = (element: unknown): element is ParameterElement =>
  element instanceof ParameterElement;

/**
 * @public
 */
export const isPayloadReplacementElement = (
  element: unknown,
): element is PayloadReplacementElement => element instanceof PayloadReplacementElement;

/**
 * @public
 */
export const isRequestBodyElement = (element: unknown): element is RequestBodyElement =>
  element instanceof RequestBodyElement;

/**
 * @public
 */
export const isReusableElement = (element: unknown): element is ReusableElement =>
  element instanceof ReusableElement;

/**
 * @public
 */
export const isSourceDescriptionElement = (element: unknown): element is SourceDescriptionElement =>
  element instanceof SourceDescriptionElement;

/**
 * @public
 */
export const isStepElement = (element: unknown): element is StepElement =>
  element instanceof StepElement;

/**
 * @public
 */
export const isSuccessActionElement = (element: unknown): element is SuccessActionElement =>
  element instanceof SuccessActionElement;

/**
 * @public
 */
export const isWorkflowElement = (element: unknown): element is WorkflowElement =>
  element instanceof WorkflowElement;

/**
 * @public
 */
export const isComponentsFailureActionsElement = (
  element: unknown,
): element is ComponentsFailureActionsElement => element instanceof ComponentsFailureActionsElement;

/**
 * @public
 */
export const isComponentsInputsElement = (element: unknown): element is ComponentsInputsElement =>
  element instanceof ComponentsInputsElement;

/**
 * @public
 */
export const isComponentsParametersElement = (
  element: unknown,
): element is ComponentsParametersElement => element instanceof ComponentsParametersElement;

/**
 * @public
 */
export const isComponentsSuccessActionsElement = (
  element: unknown,
): element is ComponentsSuccessActionsElement => element instanceof ComponentsSuccessActionsElement;

/**
 * @public
 */
export const isFailureActionCriteriaElement = (
  element: unknown,
): element is FailureActionCriteriaElement => element instanceof FailureActionCriteriaElement;

/**
 * @public
 */
export const isRequestBodyReplacementsElement = (
  element: unknown,
): element is RequestBodyReplacementsElement => element instanceof RequestBodyReplacementsElement;

/**
 * @public
 */
export const isSourceDescriptionsElement = (
  element: unknown,
): element is SourceDescriptionsElement => element instanceof SourceDescriptionsElement;

/**
 * @public
 */
export const isStepDependsOnElement = (element: unknown): element is StepDependsOnElement =>
  element instanceof StepDependsOnElement;

/**
 * @public
 */
export const isStepOnFailureElement = (element: unknown): element is StepOnFailureElement =>
  element instanceof StepOnFailureElement;

/**
 * @public
 */
export const isStepOnSuccessElement = (element: unknown): element is StepOnSuccessElement =>
  element instanceof StepOnSuccessElement;

/**
 * @public
 */
export const isStepOutputsElement = (element: unknown): element is StepOutputsElement =>
  element instanceof StepOutputsElement;

/**
 * @public
 */
export const isStepParametersElement = (element: unknown): element is StepParametersElement =>
  element instanceof StepParametersElement;

/**
 * @public
 */
export const isStepSuccessCriteriaElement = (
  element: unknown,
): element is StepSuccessCriteriaElement => element instanceof StepSuccessCriteriaElement;

/**
 * @public
 */
export const isSuccessActionCriteriaElement = (
  element: unknown,
): element is SuccessActionCriteriaElement => element instanceof SuccessActionCriteriaElement;

/**
 * @public
 */
export const isWorkflowDependsOnElement = (element: unknown): element is WorkflowDependsOnElement =>
  element instanceof WorkflowDependsOnElement;

/**
 * @public
 */
export const isWorkflowFailureActionsElement = (
  element: unknown,
): element is WorkflowFailureActionsElement => element instanceof WorkflowFailureActionsElement;

/**
 * @public
 */
export const isWorkflowOutputsElement = (element: unknown): element is WorkflowOutputsElement =>
  element instanceof WorkflowOutputsElement;

/**
 * @public
 */
export const isWorkflowParametersElement = (
  element: unknown,
): element is WorkflowParametersElement => element instanceof WorkflowParametersElement;

/**
 * @public
 */
export const isWorkflowsElement = (element: unknown): element is WorkflowsElement =>
  element instanceof WorkflowsElement;

/**
 * @public
 */
export const isWorkflowStepsElement = (element: unknown): element is WorkflowStepsElement =>
  element instanceof WorkflowStepsElement;

/**
 * @public
 */
export const isWorkflowSuccessActionsElement = (
  element: unknown,
): element is WorkflowSuccessActionsElement => element instanceof WorkflowSuccessActionsElement;
