import ArazzoSpecification1Element from '../elements/ArazzoSpecification1.ts';
import ArazzoElement from '../elements/Arazzo.ts';
import ComponentsElement from '../elements/Components.ts';
import CriterionElement from '../elements/Criterion.ts';
import CriterionExpressionTypeElement from '../elements/CriterionExpressionType.ts';
import FailureActionElement from '../elements/FailureAction.ts';
import InfoElement from '../elements/Info.ts';
import JSONSchemaElement from '../elements/JSONSchema.ts';
import ParameterElement from '../elements/Parameter.ts';
import PayloadReplacementElement from '../elements/PayloadReplacement.ts';
import RequestBodyElement from '../elements/RequestBody.ts';
import ReusableElement from '../elements/Reusable.ts';
import SourceDescriptionElement from '../elements/SourceDescription.ts';
import StepElement from '../elements/Step.ts';
import SuccessActionElement from '../elements/SuccessAction.ts';
import WorkflowElement from '../elements/Workflow.ts';
import { createRefractor } from './index.ts';

ArazzoElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'ArazzoSpecification',
  'fixedFields',
  'arazzo',
]);
ArazzoSpecification1Element.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'ArazzoSpecification',
  '$visitor',
]);
ComponentsElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'Components',
  '$visitor',
]);
CriterionElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'Criterion',
  '$visitor',
]);
CriterionExpressionTypeElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'CriterionExpressionType',
  '$visitor',
]);
FailureActionElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'FailureAction',
  '$visitor',
]);
InfoElement.refract = createRefractor(['visitors', 'document', 'objects', 'Info', '$visitor']);
JSONSchemaElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'JSONSchema',
  '$visitor',
]);
ParameterElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'Parameter',
  '$visitor',
]);
PayloadReplacementElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'PayloadReplacement',
  '$visitor',
]);
RequestBodyElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'RequestBody',
  '$visitor',
]);
ReusableElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'Reusable',
  '$visitor',
]);
SourceDescriptionElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'SourceDescription',
  '$visitor',
]);
StepElement.refract = createRefractor(['visitors', 'document', 'objects', 'Step', '$visitor']);
SuccessActionElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'SuccessAction',
  '$visitor',
]);
WorkflowElement.refract = createRefractor([
  'visitors',
  'document',
  'objects',
  'Workflow',
  '$visitor',
]);

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
};
