import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';

import ArazzoElement from '../elements/Arazzo.ts';
import ArazzoSpecification1Element from '../elements/ArazzoSpecification1.ts';
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
import specification from './specification.ts';

/**
 * @public
 */
export interface FixedField {
  name: string;
  alias?: string;
  $visitor: unknown;
}

interface ResolvedSpec extends ResolvedSpecification {
  visitors: {
    document: {
      objects: Record<string, { fixedFields: Record<string, unknown> }>;
    };
  };
}

const resolvedSpec = resolveSpecification<ResolvedSpec>(specification);

const getFixedFields = (fixedFieldsSpec: Record<string, unknown>): FixedField[] => {
  return Object.entries(fixedFieldsSpec).map(([name, fieldSpec]) => {
    if (isPlainObject(fieldSpec)) {
      return { name, ...fieldSpec } as FixedField;
    }
    return { name, $visitor: fieldSpec };
  });
};

Object.defineProperty(ArazzoSpecification1Element, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ArazzoSpecification.fixedFields),
  enumerable: true,
});

Object.defineProperty(ComponentsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Components.fixedFields),
  enumerable: true,
});

Object.defineProperty(CriterionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Criterion.fixedFields),
  enumerable: true,
});

Object.defineProperty(CriterionExpressionTypeElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.CriterionExpressionType.fixedFields),
  enumerable: true,
});

Object.defineProperty(FailureActionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.FailureAction.fixedFields),
  enumerable: true,
});

Object.defineProperty(InfoElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Info.fixedFields),
  enumerable: true,
});

Object.defineProperty(JSONSchemaElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.JSONSchema.fixedFields),
  enumerable: true,
});

Object.defineProperty(ParameterElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Parameter.fixedFields),
  enumerable: true,
});

Object.defineProperty(PayloadReplacementElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.PayloadReplacement.fixedFields),
  enumerable: true,
});

Object.defineProperty(RequestBodyElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.RequestBody.fixedFields),
  enumerable: true,
});

Object.defineProperty(ReusableElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Reusable.fixedFields),
  enumerable: true,
});

Object.defineProperty(SourceDescriptionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.SourceDescription.fixedFields),
  enumerable: true,
});

Object.defineProperty(StepElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Step.fixedFields),
  enumerable: true,
});

Object.defineProperty(SuccessActionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.SuccessAction.fixedFields),
  enumerable: true,
});

Object.defineProperty(WorkflowElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Workflow.fixedFields),
  enumerable: true,
});

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
