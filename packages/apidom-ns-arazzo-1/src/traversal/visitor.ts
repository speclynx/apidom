import { keyMap as keyMapBase, isElement, Element } from '@speclynx/apidom-core';

/**
 * @public
 */
export const getNodeType = <T extends Element>(element: T): string | undefined => {
  if (!isElement(element)) {
    return undefined;
  }
  return `${element.element.charAt(0).toUpperCase() + element.element.slice(1)}Element`;
};

/**
 * Arazzo Specification 1.0.1
 * @public
 */

export const keyMap = {
  ArazzoSpecification1Element: ['content'],
  ComponentsElement: ['content'],
  CriterionElement: ['content'],
  CriterionExpressionTypeElement: ['content'],
  FailureActionElement: ['content'],
  InfoElement: ['content'],
  ParameterElement: ['content'],
  PayloadReplacementElement: ['content'],
  RequestBodyElement: ['content'],
  ReusableElement: ['content'],
  SourceDescriptionElement: ['content'],
  StepElement: ['content'],
  SuccessActionElement: ['content'],
  WorkflowElement: ['content'],
  JSONSchema202012Element: ['content'],
  ...keyMapBase,
};
