import {
  ArrayElement,
  Element,
  ObjectElement,
  type Meta,
  type Attributes,
  isStringElement,
  isArrayElement,
  isElement,
  isMemberElement,
  includesClasses,
  cloneDeep,
  SourceMapElement,
  StyleElement,
} from '@speclynx/apidom-datamodel';
import { Path, getNodeType } from '@speclynx/apidom-traverse';
import { toValue } from '@speclynx/apidom-core';

/**
 * Arazzo 1.1.0 specification elements.
 */
import ComponentsElement from '../../elements/Components.ts';
import CriterionElement from '../../elements/Criterion.ts';
import FailureActionElement from '../../elements/FailureAction.ts';
import InfoElement from '../../elements/Info.ts';
import JSONSchemaElement from '../../elements/JSONSchema.ts';
import ParameterElement from '../../elements/Parameter.ts';
import PayloadReplacementElement from '../../elements/PayloadReplacement.ts';
import RequestBodyElement from '../../elements/RequestBody.ts';
import SourceDescriptionElement from '../../elements/SourceDescription.ts';
import StepElement from '../../elements/Step.ts';
import SuccessActionElement from '../../elements/SuccessAction.ts';
import WorkflowElement from '../../elements/Workflow.ts';
/**
 * Arazzo 1.1.0 non-concrete elements.
 */
import ComponentsFailureActionsElement from '../../elements/nces/ComponentsFailureActions.ts';
import ComponentsInputsElement from '../../elements/nces/ComponentsInputs.ts';
import ComponentsParametersElement from '../../elements/nces/ComponentsParameters.ts';
import ComponentsSuccessActionsElement from '../../elements/nces/ComponentsSuccessActions.ts';
import FailureActionCriteriaElement from '../../elements/nces/FailureActionCriteria.ts';
import FailureActionParametersElement from '../../elements/nces/FailureActionParameters.ts';
import RequestBodyReplacementsElement from '../../elements/nces/RequestBodyReplacements.ts';
import SourceDescriptionsElement from '../../elements/nces/SourceDescriptions.ts';
import StepDependsOnElement from '../../elements/nces/StepDependsOn.ts';
import StepOnFailureElement from '../../elements/nces/StepOnFailure.ts';
import StepOnSuccessElement from '../../elements/nces/StepOnSuccess.ts';
import StepOutputsElement from '../../elements/nces/StepOutputs.ts';
import StepParametersElement from '../../elements/nces/StepParameters.ts';
import StepSuccessCriteriaElement from '../../elements/nces/StepSuccessCriteria.ts';
import SuccessActionCriteriaElement from '../../elements/nces/SuccessActionCriteria.ts';
import SuccessActionParametersElement from '../../elements/nces/SuccessActionParameters.ts';
import WorkflowDependsOnElement from '../../elements/nces/WorkflowDependsOn.ts';
import WorkflowFailureActionsElement from '../../elements/nces/WorkflowFailureActions.ts';
import WorkflowOutputsElement from '../../elements/nces/WorkflowOutputs.ts';
import WorkflowParametersElement from '../../elements/nces/WorkflowParameters.ts';
import WorkflowsElement from '../../elements/nces/Workflows.ts';
import WorkflowStepsElement from '../../elements/nces/WorkflowSteps.ts';
import WorkflowSuccessActionsElement from '../../elements/nces/WorkflowSuccessActions.ts';

/**
 * This plugin is specific to YAML 1.2 format, which allows defining key-value pairs
 * with empty key, empty value, or both. If the value is not provided in YAML format,
 * this plugin compensates for this missing value with the most appropriate semantic element type.
 *
 * https://yaml.org/spec/1.2.2/#72-empty-nodes
 *
 * @example
 *
 * ```yaml
 * arazzo: 1.1.0
 * info:
 * ```
 * Refracting result without this plugin:
 *
 *  (ArazzoSpecification1Element
 *    (MemberElement
 *      (StringElement)
 *      (ArazzoElement))
 *    (MemberElement
 *      (StringElement)
 *      (StringElement))
 *
 * Refracting result with this plugin:
 *
 *  (ArazzoSpecification1Element
 *    (MemberElement
 *      (StringElement)
 *      (ArazzoElement))
 *    (MemberElement
 *      (StringElement)
 *      (InfoElement))
 */

type ElementFactory = (content?: undefined, meta?: Meta, attributes?: Attributes) => Element;

const isEmptyElement = (element: unknown) =>
  isStringElement(element) && includesClasses(element, ['yaml-e-node', 'yaml-e-scalar']);

const schema: Record<string, Record<string, ElementFactory>> = {
  // concrete types handling (CTs)
  ArazzoSpecification1Element: {
    info: (content, meta, attributes) => new InfoElement(content, meta, attributes),
    sourceDescriptions: (content, meta, attributes) =>
      new SourceDescriptionsElement(content, meta, attributes),
    workflows: (content, meta, attributes) => new WorkflowsElement(content, meta, attributes),
    components: (content, meta, attributes) => new ComponentsElement(content, meta, attributes),
  },
  WorkflowElement: {
    inputs: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    dependsOn: (content, meta, attributes) =>
      new WorkflowDependsOnElement(content, meta, attributes),
    steps: (content, meta, attributes) => new WorkflowStepsElement(content, meta, attributes),
    successActions: (content, meta, attributes) =>
      new WorkflowSuccessActionsElement(content, meta, attributes),
    failureActions: (content, meta, attributes) =>
      new WorkflowFailureActionsElement(content, meta, attributes),
    outputs: (content, meta, attributes) => new WorkflowOutputsElement(content, meta, attributes),
    parameters: (content, meta, attributes) =>
      new WorkflowParametersElement(content, meta, attributes),
  },
  StepElement: {
    parameters: (content, meta, attributes) => new StepParametersElement(content, meta, attributes),
    requestBody: (content, meta, attributes) => new RequestBodyElement(content, meta, attributes),
    successCriteria: (content, meta, attributes) =>
      new StepSuccessCriteriaElement(content, meta, attributes),
    onSuccess: (content, meta, attributes) => new StepOnSuccessElement(content, meta, attributes),
    onFailure: (content, meta, attributes) => new StepOnFailureElement(content, meta, attributes),
    outputs: (content, meta, attributes) => new StepOutputsElement(content, meta, attributes),
    dependsOn: (content, meta, attributes) => new StepDependsOnElement(content, meta, attributes),
  },
  SuccessActionElement: {
    parameters: (content, meta, attributes) =>
      new SuccessActionParametersElement(content, meta, attributes),
    criteria: (content, meta, attributes) =>
      new SuccessActionCriteriaElement(content, meta, attributes),
  },
  FailureActionElement: {
    parameters: (content, meta, attributes) =>
      new FailureActionParametersElement(content, meta, attributes),
    criteria: (content, meta, attributes) =>
      new FailureActionCriteriaElement(content, meta, attributes),
  },
  ComponentsElement: {
    inputs: (content, meta, attributes) => new ComponentsInputsElement(content, meta, attributes),
    parameters: (content, meta, attributes) =>
      new ComponentsParametersElement(content, meta, attributes),
    successActions: (content, meta, attributes) =>
      new ComponentsSuccessActionsElement(content, meta, attributes),
    failureActions: (content, meta, attributes) =>
      new ComponentsFailureActionsElement(content, meta, attributes),
  },
  RequestBodyElement: {
    replacements: (content, meta, attributes) =>
      new RequestBodyReplacementsElement(content, meta, attributes),
  },
  JSONSchemaElement: {
    $vocabulary: (content, meta, attributes) => {
      const element = new ObjectElement(content, meta, attributes);
      element.classes.push('json-schema-$vocabulary');
      return element;
    },
    $defs: (content, meta, attributes) => {
      const element = new ObjectElement(content, meta, attributes);
      element.classes.push('json-schema-$defs');
      return element;
    },
    allOf: (content, meta, attributes) => {
      const element = new ArrayElement(content, meta, attributes);
      element.classes.push('json-schema-allOf');
      return element;
    },
    anyOf: (content, meta, attributes) => {
      const element = new ArrayElement(content, meta, attributes);
      element.classes.push('json-schema-anyOf');
      return element;
    },
    oneOf: (content, meta, attributes) => {
      const element = new ArrayElement(content, meta, attributes);
      element.classes.push('json-schema-oneOf');
      return element;
    },
    not: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    if: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    then: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    else: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    dependentSchemas: (content, meta, attributes) => {
      const element = new ObjectElement(content, meta, attributes);
      element.classes.push('json-schema-dependentSchemas');
      return element;
    },
    prefixItems: (content, meta, attributes) => {
      const element = new ArrayElement(content, meta, attributes);
      element.classes.push('json-schema-prefixItems');
      return element;
    },
    items: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    contains: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    properties: (content, meta, attributes) => {
      const element = new ObjectElement(content, meta, attributes);
      element.classes.push('json-schema-properties');
      return element;
    },
    patternProperties: (content, meta, attributes) => {
      const element = new ObjectElement(content, meta, attributes);
      element.classes.push('json-schema-patternProperties');
      return element;
    },
    additionalProperties: (content, meta, attributes) =>
      new JSONSchemaElement(content, meta, attributes),
    propertyNames: (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
    unevaluatedItems: (content, meta, attributes) =>
      new JSONSchemaElement(content, meta, attributes),
    unevaluatedProperties: (content, meta, attributes) =>
      new JSONSchemaElement(content, meta, attributes),
    type: (content, meta, attributes) => {
      const element = new ArrayElement(content, meta, attributes);
      element.classes.push('json-schema-type');
      return element;
    },
  },
  // non-concrete types handling (NCEs)
  [SourceDescriptionsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new SourceDescriptionElement(content, meta, attributes),
  },
  [WorkflowsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new WorkflowElement(content, meta, attributes),
  },
  [WorkflowStepsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new StepElement(content, meta, attributes),
  },
  [WorkflowSuccessActionsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new SuccessActionElement(content, meta, attributes),
  },
  [WorkflowFailureActionsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new FailureActionElement(content, meta, attributes),
  },
  [WorkflowParametersElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new ParameterElement(content, meta, attributes),
  },
  [StepParametersElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new ParameterElement(content, meta, attributes),
  },
  [StepSuccessCriteriaElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new CriterionElement(content, meta, attributes),
  },
  [StepOnSuccessElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new SuccessActionElement(content, meta, attributes),
  },
  [StepOnFailureElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new FailureActionElement(content, meta, attributes),
  },
  [SuccessActionParametersElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new ParameterElement(content, meta, attributes),
  },
  [SuccessActionCriteriaElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new CriterionElement(content, meta, attributes),
  },
  [FailureActionParametersElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new ParameterElement(content, meta, attributes),
  },
  [FailureActionCriteriaElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new CriterionElement(content, meta, attributes),
  },
  [ComponentsInputsElement.primaryClass]: {
    '[key: *]': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  [ComponentsParametersElement.primaryClass]: {
    '[key: *]': (content, meta, attributes) => new ParameterElement(content, meta, attributes),
  },
  [ComponentsSuccessActionsElement.primaryClass]: {
    '[key: *]': (content, meta, attributes) => new SuccessActionElement(content, meta, attributes),
  },
  [ComponentsFailureActionsElement.primaryClass]: {
    '[key: *]': (content, meta, attributes) => new FailureActionElement(content, meta, attributes),
  },
  [RequestBodyReplacementsElement.primaryClass]: {
    '<*>': (content, meta, attributes) => new PayloadReplacementElement(content, meta, attributes),
  },
  'json-schema-$defs': {
    '[key: *]': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-properties': {
    '[key: *]': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-patternProperties': {
    '[key: *]': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-dependentSchemas': {
    '[key: *]': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-allOf': {
    '<*>': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-anyOf': {
    '<*>': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-oneOf': {
    '<*>': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
  'json-schema-prefixItems': {
    '<*>': (content, meta, attributes) => new JSONSchemaElement(content, meta, attributes),
  },
};

const findElementFactory = (ancestor: Element, keyName: string): ElementFactory | undefined => {
  const elementType = getNodeType(ancestor);
  const classType = ancestor.isMetaEmpty ? undefined : ancestor.classes.at(0);
  const keyMapping = schema[elementType as string] || schema[classType as string];

  if (typeof keyMapping === 'undefined') return undefined;

  return Object.hasOwn(keyMapping, '[key: *]') ? keyMapping['[key: *]'] : keyMapping[keyName];
};

/**
 * @public
 */
const plugin = () => () => ({
  visitor: {
    StringElement(path: Path<Element>) {
      const element = path.node;
      if (!isEmptyElement(element)) return;

      const ancestors = path.getAncestorNodes().filter(isElement);
      const parentElement = ancestors.at(0); // immediate parent first
      let elementFactory;
      let context;

      if (isArrayElement(parentElement)) {
        context = element;
        elementFactory = findElementFactory(parentElement, '<*>');
      } else if (isMemberElement(parentElement)) {
        context = ancestors.at(1); // grandparent
        elementFactory = findElementFactory(context!, toValue(parentElement.key) as string);
      }

      // no element factory found
      if (typeof elementFactory !== 'function') return;

      const replacement = elementFactory(
        undefined,
        element.isMetaEmpty ? undefined : cloneDeep(element.meta),
        element.isAttributesEmpty ? undefined : cloneDeep(element.attributes),
      );
      SourceMapElement.transfer(element, replacement);
      StyleElement.transfer(element, replacement);
      path.replaceWith(replacement);
    },
  },
});

export default plugin;
