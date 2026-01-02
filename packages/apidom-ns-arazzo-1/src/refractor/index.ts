import { visit, resolveSpecification, dispatchRefractorPlugins } from '@speclynx/apidom-core';
import { Element, refract as baseRefract } from '@speclynx/apidom-datamodel';
import { path } from 'ramda';

import type VisitorClass from './visitors/Visitor.ts';
import specification from './specification.ts';
import { keyMap, getNodeType } from '../traversal/visitor.ts';
import createToolbox, { type Toolbox } from './toolbox.ts';
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

/**
 * @public
 */
export type RefractorPlugin = (toolbox: Toolbox) => {
  visitor?: object;
  pre?: () => void;
  post?: () => void;
};

/**
 * @public
 */
export interface RefractorOptions {
  readonly element?: string;
  readonly plugins?: RefractorPlugin[];
  readonly specificationObj?: typeof specification;
}

/**
 * @public
 */
const refract = <T extends Element>(
  value: unknown,
  {
    element = 'arazzoSpecification1',
    plugins = [],
    specificationObj = specification,
  }: RefractorOptions = {},
): T => {
  const genericElement = baseRefract(value);
  const resolvedSpec = resolveSpecification(specificationObj);
  const elementMap = resolvedSpec.elementMap as Record<string, string[]>;
  const specPath = elementMap[element];

  if (!specPath) {
    throw new Error(`Unknown element type: "${element}"`);
  }

  /**
   * This is where generic ApiDOM becomes semantic (namespace applied).
   * We don't allow consumers to hook into this translation.
   * Though we allow consumers to define their own plugins on already transformed ApiDOM.
   */
  const RootVisitorClass = path(specPath, resolvedSpec) as typeof VisitorClass;
  const rootVisitor = new RootVisitorClass({ specObj: resolvedSpec });

  visit(genericElement, rootVisitor);

  /**
   * Running plugins visitors means extra single traversal === performance hit.
   */
  return dispatchRefractorPlugins(rootVisitor.element, plugins, {
    toolboxCreator: createToolbox,
    visitorOptions: { keyMap, nodeTypeGetter: getNodeType },
  }) as T;
};

/**
 * @public
 */
export const refractArazzo = <T extends Element = ArazzoElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'arazzo' });

/**
 * @public
 */
export const refractArazzoSpecification1 = <T extends Element = ArazzoSpecification1Element>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'arazzoSpecification1' });

/**
 * @public
 */
export const refractComponents = <T extends Element = ComponentsElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'components' });

/**
 * @public
 */
export const refractCriterion = <T extends Element = CriterionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'criterion' });

/**
 * @public
 */
export const refractCriterionExpressionType = <T extends Element = CriterionExpressionTypeElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'criterionExpressionType' });

/**
 * @public
 */
export const refractFailureAction = <T extends Element = FailureActionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'failureAction' });

/**
 * @public
 */
export const refractInfo = <T extends Element = InfoElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'info' });

/**
 * @public
 */
export const refractJSONSchema = <T extends Element = JSONSchemaElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'jSONSchema202012' });

/**
 * @public
 */
export const refractParameter = <T extends Element = ParameterElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'parameter' });

/**
 * @public
 */
export const refractPayloadReplacement = <T extends Element = PayloadReplacementElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'payloadReplacement' });

/**
 * @public
 */
export const refractRequestBody = <T extends Element = RequestBodyElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'requestBody' });

/**
 * @public
 */
export const refractReusable = <T extends Element = ReusableElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'reusable' });

/**
 * @public
 */
export const refractSourceDescription = <T extends Element = SourceDescriptionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'sourceDescription' });

/**
 * @public
 */
export const refractStep = <T extends Element = StepElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'step' });

/**
 * @public
 */
export const refractSuccessAction = <T extends Element = SuccessActionElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'successAction' });

/**
 * @public
 */
export const refractWorkflow = <T extends Element = WorkflowElement>(
  value: unknown,
  options: Omit<RefractorOptions, 'element'> = {},
): T => refract(value, { ...options, element: 'workflow' });

export default refract;
