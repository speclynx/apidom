import { assert } from 'chai';

import {
  isArazzoSpecification1Element,
  isArazzoElement,
  isInfoElement,
  isSourceDescriptionElement,
  isSourceDescriptionsElement,
  isWorkflowElement,
  isWorkflowStepsElement,
  isWorkflowOutputsElement,
  isWorkflowDependsOnElement,
  isWorkflowFailureActionsElement,
  isWorkflowParametersElement,
  isWorkflowsElement,
  isWorkflowSuccessActionsElement,
  isParameterElement,
  isStepElement,
  isStepParametersElement,
  isStepDependsOnElement,
  isStepSuccessCriteriaElement,
  isStepOnSuccessElement,
  isStepOnFailureElement,
  isStepOutputsElement,
  isSuccessActionElement,
  isSuccessActionCriteriaElement,
  isFailureActionElement,
  isFailureActionCriteriaElement,
  isComponentsElement,
  isComponentsFailureActionsElement,
  isComponentsInputsElement,
  isComponentsParametersElement,
  isComponentsSuccessActionsElement,
  isCriterionElement,
  isCriterionExpressionTypeElement,
  isJSONSchemaElement,
  isPayloadReplacementElement,
  isRequestBodyElement,
  isRequestBodyReplacementsElement,
  isReusableElement,
  ArazzoSpecification1Element,
  ArazzoElement,
  InfoElement,
  SourceDescriptionElement,
  SourceDescriptionsElement,
  WorkflowElement,
  WorkflowStepsElement,
  WorkflowOutputsElement,
  WorkflowDependsOnElement,
  WorkflowFailureActionsElement,
  WorkflowParametersElement,
  WorkflowsElement,
  WorkflowSuccessActionsElement,
  StepElement,
  StepParametersElement,
  StepDependsOnElement,
  StepOnSuccessElement,
  StepOnFailureElement,
  StepOutputsElement,
  StepSuccessCriteriaElement,
  ParameterElement,
  SuccessActionElement,
  SuccessActionCriteriaElement,
  FailureActionElement,
  FailureActionCriteriaElement,
  ComponentsElement,
  ComponentsFailureActionsElement,
  ComponentsInputsElement,
  ComponentsParametersElement,
  ComponentsSuccessActionsElement,
  CriterionElement,
  CriterionExpressionTypeElement,
  JSONSchemaElement,
  PayloadReplacementElement,
  RequestBodyElement,
  RequestBodyReplacementsElement,
  ReusableElement,
} from '../src/index.ts';

describe('predicates', function () {
  context('isArazzoSpecificationElement', function () {
    context('given ArazzoSpecificationElement instance value', function () {
      specify('should return true', function () {
        const element = new ArazzoSpecification1Element();

        assert.isTrue(isArazzoSpecification1Element(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowsSpecificationSubElement extends ArazzoSpecification1Element {}

        assert.isTrue(isArazzoSpecification1Element(new WorkflowsSpecificationSubElement()));
      });
    });

    context('given non isArazzoSpecification1Element instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isArazzoSpecification1Element(1));
        assert.isFalse(isArazzoSpecification1Element(null));
        assert.isFalse(isArazzoSpecification1Element(undefined));
        assert.isFalse(isArazzoSpecification1Element({}));
        assert.isFalse(isArazzoSpecification1Element([]));
        assert.isFalse(isArazzoSpecification1Element('string'));
      });
    });
  });

  context('isInfoElement', function () {
    context('given InfoElement instance value', function () {
      specify('should return true', function () {
        const element = new InfoElement();

        assert.isTrue(isInfoElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class InfoSubElement extends InfoElement {}

        assert.isTrue(isInfoElement(new InfoSubElement()));
      });
    });

    context('given non InfoElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isInfoElement(1));
        assert.isFalse(isInfoElement(null));
        assert.isFalse(isInfoElement(undefined));
        assert.isFalse(isInfoElement({}));
        assert.isFalse(isInfoElement([]));
        assert.isFalse(isInfoElement('string'));
      });
    });
  });

  context('isArazzoElement', function () {
    context('given ArazzoElement instance value', function () {
      specify('should return true', function () {
        const element = new ArazzoElement();

        assert.isTrue(isArazzoElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ArazzoSubElement extends ArazzoElement {}

        assert.isTrue(isArazzoElement(new ArazzoSubElement()));
      });
    });

    context('given non ArazzoElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isArazzoElement(1));
        assert.isFalse(isArazzoElement(null));
        assert.isFalse(isArazzoElement(undefined));
        assert.isFalse(isArazzoElement({}));
        assert.isFalse(isArazzoElement([]));
        assert.isFalse(isArazzoElement('string'));
      });
    });
  });

  context('isSourceDescriptionElement', function () {
    context('given SourceDescriptionElement instance value', function () {
      specify('should return true', function () {
        const element = new SourceDescriptionElement();

        assert.isTrue(isSourceDescriptionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SourceDescriptionSubElement extends SourceDescriptionElement {}

        assert.isTrue(isSourceDescriptionElement(new SourceDescriptionSubElement()));
      });
    });

    context('given non SourceDescriptionElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSourceDescriptionElement(1));
        assert.isFalse(isSourceDescriptionElement(null));
        assert.isFalse(isSourceDescriptionElement(undefined));
        assert.isFalse(isSourceDescriptionElement({}));
        assert.isFalse(isSourceDescriptionElement([]));
        assert.isFalse(isSourceDescriptionElement('string'));
      });
    });
  });

  context('isSourceDescriptionsElement', function () {
    context('given SourceDescriptionsElement instance value', function () {
      specify('should return true', function () {
        const element = new SourceDescriptionsElement();

        assert.isTrue(isSourceDescriptionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SourceDescriptionsSubElement extends SourceDescriptionsElement {}

        assert.isTrue(isSourceDescriptionsElement(new SourceDescriptionsSubElement()));
      });
    });

    context('given non SourceDescriptions instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSourceDescriptionsElement(1));
        assert.isFalse(isSourceDescriptionsElement(null));
        assert.isFalse(isSourceDescriptionsElement(undefined));
        assert.isFalse(isSourceDescriptionsElement({}));
        assert.isFalse(isSourceDescriptionsElement([]));
        assert.isFalse(isSourceDescriptionsElement('string'));
      });
    });
  });

  context('isComponentsElement', function () {
    context('given ComponentsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsElement();

        assert.isTrue(isComponentsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsSubElement extends ComponentsElement {}

        assert.isTrue(isComponentsElement(new ComponentsSubElement()));
      });
    });

    context('given non ComponentsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsElement(1));
        assert.isFalse(isComponentsElement(null));
        assert.isFalse(isComponentsElement(undefined));
        assert.isFalse(isComponentsElement({}));
        assert.isFalse(isComponentsElement([]));
        assert.isFalse(isComponentsElement('string'));
      });
    });
  });

  context('isCriterionElement', function () {
    context('given CriterionElement instance value', function () {
      specify('should return true', function () {
        const element = new CriterionElement();

        assert.isTrue(isCriterionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class CriterionSubElement extends CriterionElement {}

        assert.isTrue(isCriterionElement(new CriterionSubElement()));
      });
    });

    context('given non CriterionSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isCriterionElement(1));
        assert.isFalse(isCriterionElement(null));
        assert.isFalse(isCriterionElement(undefined));
        assert.isFalse(isCriterionElement({}));
        assert.isFalse(isCriterionElement([]));
        assert.isFalse(isCriterionElement('string'));
      });
    });
  });

  context('isSuccessActionCriteriaElement', function () {
    context('given SuccessActionCriteriaElement instance value', function () {
      specify('should return true', function () {
        const element = new SuccessActionCriteriaElement();

        assert.isTrue(isSuccessActionCriteriaElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SuccessActionCriteriaSubElement extends SuccessActionCriteriaElement {}

        assert.isTrue(isSuccessActionCriteriaElement(new SuccessActionCriteriaSubElement()));
      });
    });

    context('given non SuccessActionCriteriaElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSuccessActionCriteriaElement(1));
        assert.isFalse(isSuccessActionCriteriaElement(null));
        assert.isFalse(isSuccessActionCriteriaElement(undefined));
        assert.isFalse(isSuccessActionCriteriaElement({}));
        assert.isFalse(isSuccessActionCriteriaElement([]));
        assert.isFalse(isSuccessActionCriteriaElement('string'));
      });
    });
  });

  context('isParameterElement', function () {
    context('given ParameterElement instance value', function () {
      specify('should return true', function () {
        const element = new ParameterElement();

        assert.isTrue(isParameterElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ParameterSubElement extends ParameterElement {}

        assert.isTrue(isParameterElement(new ParameterSubElement()));
      });
    });

    context('given non ParameterSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isParameterElement(1));
        assert.isFalse(isParameterElement(null));
        assert.isFalse(isParameterElement(undefined));
        assert.isFalse(isParameterElement({}));
        assert.isFalse(isParameterElement([]));
        assert.isFalse(isParameterElement('string'));
      });
    });
  });

  context('isSuccessActionElement', function () {
    context('given SuccessActionElement instance value', function () {
      specify('should return true', function () {
        const element = new SuccessActionElement();

        assert.isTrue(isSuccessActionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class SuccessActionSubElement extends SuccessActionElement {}

        assert.isTrue(isSuccessActionElement(new SuccessActionSubElement()));
      });
    });

    context('given non SuccessActionSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isSuccessActionElement(1));
        assert.isFalse(isSuccessActionElement(null));
        assert.isFalse(isSuccessActionElement(undefined));
        assert.isFalse(isSuccessActionElement({}));
        assert.isFalse(isSuccessActionElement([]));
        assert.isFalse(isSuccessActionElement('string'));
      });
    });
  });

  context('isFailureActionCriteriaElement', function () {
    context('given FailureActionCriteriaElement instance value', function () {
      specify('should return true', function () {
        const element = new FailureActionCriteriaElement();

        assert.isTrue(isFailureActionCriteriaElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class FailureActionCriteriaSubElement extends FailureActionCriteriaElement {}

        assert.isTrue(isFailureActionCriteriaElement(new FailureActionCriteriaSubElement()));
      });
    });

    context('given non FailureActionCriteriaElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isFailureActionCriteriaElement(1));
        assert.isFalse(isFailureActionCriteriaElement(null));
        assert.isFalse(isFailureActionCriteriaElement(undefined));
        assert.isFalse(isFailureActionCriteriaElement({}));
        assert.isFalse(isFailureActionCriteriaElement([]));
        assert.isFalse(isFailureActionCriteriaElement('string'));
      });
    });
  });

  context('isFailureActionElement', function () {
    context('given FailureActionElement instance value', function () {
      specify('should return true', function () {
        const element = new FailureActionElement();

        assert.isTrue(isFailureActionElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class FailureActionSubElement extends FailureActionElement {}

        assert.isTrue(isFailureActionElement(new FailureActionSubElement()));
      });
    });

    context('given non FailureActionSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isFailureActionElement(1));
        assert.isFalse(isFailureActionElement(null));
        assert.isFalse(isFailureActionElement(undefined));
        assert.isFalse(isFailureActionElement({}));
        assert.isFalse(isFailureActionElement([]));
        assert.isFalse(isFailureActionElement('string'));
      });
    });
  });

  context('isReusableElement', function () {
    context('given ReusableElement instance value', function () {
      specify('should return true', function () {
        const element = new ReusableElement();

        assert.isTrue(isReusableElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ReusableSubElement extends ReusableElement {}

        assert.isTrue(isReusableElement(new ReusableSubElement()));
      });
    });

    context('given non ReusableElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isReusableElement(1));
        assert.isFalse(isReusableElement(null));
        assert.isFalse(isReusableElement(undefined));
        assert.isFalse(isReusableElement({}));
        assert.isFalse(isReusableElement([]));
        assert.isFalse(isReusableElement('string'));
      });
    });
  });

  context('isWorkflowElement', function () {
    context('given WorkflowElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowElement();

        assert.isTrue(isWorkflowElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowSubElement extends WorkflowElement {}

        assert.isTrue(isWorkflowElement(new WorkflowSubElement()));
      });
    });

    context('given non WorkflowElementSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowElement(1));
        assert.isFalse(isWorkflowElement(null));
        assert.isFalse(isWorkflowElement(undefined));
        assert.isFalse(isWorkflowElement({}));
        assert.isFalse(isWorkflowElement([]));
        assert.isFalse(isWorkflowElement('string'));
      });
    });
  });

  context('isWorkflowStepsElement', function () {
    context('given WorkflowStepsElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowStepsElement();

        assert.isTrue(isWorkflowStepsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowStepsSubElement extends WorkflowStepsElement {}

        assert.isTrue(isWorkflowStepsElement(new WorkflowStepsSubElement()));
      });
    });

    context('given non WorkflowSteps instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowStepsElement(1));
        assert.isFalse(isWorkflowStepsElement(null));
        assert.isFalse(isWorkflowStepsElement(undefined));
        assert.isFalse(isWorkflowStepsElement({}));
        assert.isFalse(isWorkflowStepsElement([]));
        assert.isFalse(isWorkflowStepsElement('string'));
      });
    });
  });

  context('isWorkflowOutputsElement', function () {
    context('given WorkflowOutputsElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowOutputsElement();

        assert.isTrue(isWorkflowOutputsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowOutputsSubElement extends WorkflowOutputsElement {}

        assert.isTrue(isWorkflowOutputsElement(new WorkflowOutputsSubElement()));
      });
    });

    context('given non WorkflowOutputs instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowOutputsElement(1));
        assert.isFalse(isWorkflowOutputsElement(null));
        assert.isFalse(isWorkflowOutputsElement(undefined));
        assert.isFalse(isWorkflowOutputsElement({}));
        assert.isFalse(isWorkflowOutputsElement([]));
        assert.isFalse(isWorkflowOutputsElement('string'));
      });
    });
  });

  context('isStepElement', function () {
    context('given StepElement instance value', function () {
      specify('should return true', function () {
        const element = new StepElement();

        assert.isTrue(isStepElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepSubElement extends StepElement {}

        assert.isTrue(isStepElement(new StepSubElement()));
      });
    });

    context('given non StepElementSubElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepElement(1));
        assert.isFalse(isStepElement(null));
        assert.isFalse(isStepElement(undefined));
        assert.isFalse(isStepElement({}));
        assert.isFalse(isStepElement([]));
        assert.isFalse(isStepElement('string'));
      });
    });
  });

  context('isStepParametersElement', function () {
    context('given StepParametersElement instance value', function () {
      specify('should return true', function () {
        const element = new StepParametersElement();

        assert.isTrue(isStepParametersElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepParametersSubElement extends StepParametersElement {}

        assert.isTrue(isStepParametersElement(new StepParametersSubElement()));
      });
    });

    context('given non StepParameters instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepParametersElement(1));
        assert.isFalse(isStepParametersElement(null));
        assert.isFalse(isStepParametersElement(undefined));
        assert.isFalse(isStepParametersElement({}));
        assert.isFalse(isStepParametersElement([]));
        assert.isFalse(isStepParametersElement('string'));
      });
    });
  });

  context('isStepDependsOnElement', function () {
    context('given StepDependsOnElement instance value', function () {
      specify('should return true', function () {
        const element = new StepDependsOnElement();

        assert.isTrue(isStepDependsOnElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepDependsOnSubElement extends StepDependsOnElement {}

        assert.isTrue(isStepDependsOnElement(new StepDependsOnSubElement()));
      });
    });

    context('given non StepDependsOn instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepDependsOnElement(1));
        assert.isFalse(isStepDependsOnElement(null));
        assert.isFalse(isStepDependsOnElement(undefined));
        assert.isFalse(isStepDependsOnElement({}));
        assert.isFalse(isStepDependsOnElement([]));
        assert.isFalse(isStepDependsOnElement('string'));
      });
    });
  });

  context('isStepSuccessCriteriaElement', function () {
    context('given StepSuccessCriteriaElement instance value', function () {
      specify('should return true', function () {
        const element = new StepSuccessCriteriaElement();

        assert.isTrue(isStepSuccessCriteriaElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepSuccessCriteriaSubElement extends StepSuccessCriteriaElement {}

        assert.isTrue(isStepSuccessCriteriaElement(new StepSuccessCriteriaSubElement()));
      });
    });

    context('given non StepSuccessCriteria instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepSuccessCriteriaElement(1));
        assert.isFalse(isStepSuccessCriteriaElement(null));
        assert.isFalse(isStepSuccessCriteriaElement(undefined));
        assert.isFalse(isStepSuccessCriteriaElement({}));
        assert.isFalse(isStepSuccessCriteriaElement([]));
        assert.isFalse(isStepSuccessCriteriaElement('string'));
      });
    });
  });

  context('isStepOnSuccessElement', function () {
    context('given StepOnSuccessElement instance value', function () {
      specify('should return true', function () {
        const element = new StepOnSuccessElement();

        assert.isTrue(isStepOnSuccessElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepOnSuccessSubElement extends StepOnSuccessElement {}

        assert.isTrue(isStepOnSuccessElement(new StepOnSuccessSubElement()));
      });
    });

    context('given non StepOnSuccessElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepOnSuccessElement(1));
        assert.isFalse(isStepOnSuccessElement(null));
        assert.isFalse(isStepOnSuccessElement(undefined));
        assert.isFalse(isStepOnSuccessElement({}));
        assert.isFalse(isStepOnSuccessElement([]));
        assert.isFalse(isStepOnSuccessElement('string'));
      });
    });
  });

  context('isStepOnFailureElement', function () {
    context('given StepOnFailureElement instance value', function () {
      specify('should return true', function () {
        const element = new StepOnFailureElement();

        assert.isTrue(isStepOnFailureElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepOnFailureSubElement extends StepOnFailureElement {}

        assert.isTrue(isStepOnFailureElement(new StepOnFailureSubElement()));
      });
    });

    context('given non StepOnFailure instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepOnFailureElement(1));
        assert.isFalse(isStepOnFailureElement(null));
        assert.isFalse(isStepOnFailureElement(undefined));
        assert.isFalse(isStepOnFailureElement({}));
        assert.isFalse(isStepOnFailureElement([]));
        assert.isFalse(isStepOnFailureElement('string'));
      });
    });
  });

  context('isStepOutputsElement', function () {
    context('given StepOutputsElement instance value', function () {
      specify('should return true', function () {
        const element = new StepOutputsElement();

        assert.isTrue(isStepOutputsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class StepOutputsSubElement extends StepOutputsElement {}

        assert.isTrue(isStepOutputsElement(new StepOutputsSubElement()));
      });
    });

    context('given non StepOutputs instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isStepOutputsElement(1));
        assert.isFalse(isStepOutputsElement(null));
        assert.isFalse(isStepOutputsElement(undefined));
        assert.isFalse(isStepOutputsElement({}));
        assert.isFalse(isStepOutputsElement([]));
        assert.isFalse(isStepOutputsElement('string'));
      });
    });
  });

  context('isCriterionExpressionTypeElement', function () {
    context('given CriterionExpressionTypeElement instance value', function () {
      specify('should return true', function () {
        const element = new CriterionExpressionTypeElement();

        assert.isTrue(isCriterionExpressionTypeElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class CriterionExpressionTypeSubElement extends CriterionExpressionTypeElement {}

        assert.isTrue(isCriterionExpressionTypeElement(new CriterionExpressionTypeSubElement()));
      });
    });

    context('given non CriterionExpressionTypeElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isCriterionExpressionTypeElement(1));
        assert.isFalse(isCriterionExpressionTypeElement(null));
        assert.isFalse(isCriterionExpressionTypeElement(undefined));
        assert.isFalse(isCriterionExpressionTypeElement({}));
        assert.isFalse(isCriterionExpressionTypeElement([]));
        assert.isFalse(isCriterionExpressionTypeElement('string'));
      });
    });
  });

  context('isPayloadReplacementElement', function () {
    context('given PayloadReplacementElement instance value', function () {
      specify('should return true', function () {
        const element = new PayloadReplacementElement();

        assert.isTrue(isPayloadReplacementElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class PayloadReplacementSubElement extends PayloadReplacementElement {}

        assert.isTrue(isPayloadReplacementElement(new PayloadReplacementSubElement()));
      });
    });

    context('given non PayloadReplacementElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isPayloadReplacementElement(1));
        assert.isFalse(isPayloadReplacementElement(null));
        assert.isFalse(isPayloadReplacementElement(undefined));
        assert.isFalse(isPayloadReplacementElement({}));
        assert.isFalse(isPayloadReplacementElement([]));
        assert.isFalse(isPayloadReplacementElement('string'));
      });
    });
  });

  context('isRequestBodyElement', function () {
    context('given RequestBodyElement instance value', function () {
      specify('should return true', function () {
        const element = new RequestBodyElement();

        assert.isTrue(isRequestBodyElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class RequestBodySubElement extends RequestBodyElement {}

        assert.isTrue(isRequestBodyElement(new RequestBodySubElement()));
      });
    });

    context('given non RequestBodyElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isRequestBodyElement(1));
        assert.isFalse(isRequestBodyElement(null));
        assert.isFalse(isRequestBodyElement(undefined));
        assert.isFalse(isRequestBodyElement({}));
        assert.isFalse(isRequestBodyElement([]));
        assert.isFalse(isRequestBodyElement('string'));
      });
    });
  });

  context('isJSONSchemaElement', function () {
    context('given JSONSchemaElement instance value', function () {
      specify('should return true', function () {
        const element = new JSONSchemaElement();

        assert.isTrue(isJSONSchemaElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class JSONSchemaSubElement extends JSONSchemaElement {}

        assert.isTrue(isJSONSchemaElement(new JSONSchemaSubElement()));
      });
    });

    context('given non JSONSchemaElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isJSONSchemaElement(1));
        assert.isFalse(isJSONSchemaElement(null));
        assert.isFalse(isJSONSchemaElement(undefined));
        assert.isFalse(isJSONSchemaElement({}));
        assert.isFalse(isJSONSchemaElement([]));
        assert.isFalse(isJSONSchemaElement('string'));
      });
    });
  });

  context('isComponentsInputsElement', function () {
    context('given ComponentsInputsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsInputsElement();

        assert.isTrue(isComponentsInputsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsInputsSubElement extends ComponentsInputsElement {}

        assert.isTrue(isComponentsInputsElement(new ComponentsInputsSubElement()));
      });
    });

    context('given non ComponentsInputsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsInputsElement(1));
        assert.isFalse(isComponentsInputsElement(null));
        assert.isFalse(isComponentsInputsElement(undefined));
        assert.isFalse(isComponentsInputsElement({}));
        assert.isFalse(isComponentsInputsElement([]));
        assert.isFalse(isComponentsInputsElement('string'));
      });
    });
  });

  context('isComponentsParametersElement', function () {
    context('given ComponentsParametersElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsParametersElement();

        assert.isTrue(isComponentsParametersElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsParametersSubElement extends ComponentsParametersElement {}

        assert.isTrue(isComponentsParametersElement(new ComponentsParametersSubElement()));
      });
    });

    context('given non ComponentsParametersElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsParametersElement(1));
        assert.isFalse(isComponentsParametersElement(null));
        assert.isFalse(isComponentsParametersElement(undefined));
        assert.isFalse(isComponentsParametersElement({}));
        assert.isFalse(isComponentsParametersElement([]));
        assert.isFalse(isComponentsParametersElement('string'));
      });
    });
  });

  context('isComponentsSuccessActionsElement', function () {
    context('given ComponentsSuccessActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsSuccessActionsElement();

        assert.isTrue(isComponentsSuccessActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsSuccessActionsSubElement extends ComponentsSuccessActionsElement {}

        assert.isTrue(isComponentsSuccessActionsElement(new ComponentsSuccessActionsSubElement()));
      });
    });

    context('given non ComponentsSuccessActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsSuccessActionsElement(1));
        assert.isFalse(isComponentsSuccessActionsElement(null));
        assert.isFalse(isComponentsSuccessActionsElement(undefined));
        assert.isFalse(isComponentsSuccessActionsElement({}));
        assert.isFalse(isComponentsSuccessActionsElement([]));
        assert.isFalse(isComponentsSuccessActionsElement('string'));
      });
    });
  });

  context('isComponentsFailureActionsElement', function () {
    context('given ComponentsFailureActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new ComponentsFailureActionsElement();

        assert.isTrue(isComponentsFailureActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class ComponentsFailureActionsSubElement extends ComponentsFailureActionsElement {}

        assert.isTrue(isComponentsFailureActionsElement(new ComponentsFailureActionsSubElement()));
      });
    });

    context('given non ComponentsFailureActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isComponentsFailureActionsElement(1));
        assert.isFalse(isComponentsFailureActionsElement(null));
        assert.isFalse(isComponentsFailureActionsElement(undefined));
        assert.isFalse(isComponentsFailureActionsElement({}));
        assert.isFalse(isComponentsFailureActionsElement([]));
        assert.isFalse(isComponentsFailureActionsElement('string'));
      });
    });
  });

  context('isRequestBodyReplacementsElement', function () {
    context('given RequestBodyReplacementsElement instance value', function () {
      specify('should return true', function () {
        const element = new RequestBodyReplacementsElement();

        assert.isTrue(isRequestBodyReplacementsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class RequestBodyReplacementsSubElement extends RequestBodyReplacementsElement {}

        assert.isTrue(isRequestBodyReplacementsElement(new RequestBodyReplacementsSubElement()));
      });
    });

    context('given non RequestBodyReplacementsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isRequestBodyReplacementsElement(1));
        assert.isFalse(isRequestBodyReplacementsElement(null));
        assert.isFalse(isRequestBodyReplacementsElement(undefined));
        assert.isFalse(isRequestBodyReplacementsElement({}));
        assert.isFalse(isRequestBodyReplacementsElement([]));
        assert.isFalse(isRequestBodyReplacementsElement('string'));
      });
    });
  });

  context('isWorkflowDependsOnElement', function () {
    context('given WorkflowDependsOnElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowDependsOnElement();

        assert.isTrue(isWorkflowDependsOnElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowDependsOnSubElement extends WorkflowDependsOnElement {}

        assert.isTrue(isWorkflowDependsOnElement(new WorkflowDependsOnSubElement()));
      });
    });

    context('given non WorkflowDependsOnElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowDependsOnElement(1));
        assert.isFalse(isWorkflowDependsOnElement(null));
        assert.isFalse(isWorkflowDependsOnElement(undefined));
        assert.isFalse(isWorkflowDependsOnElement({}));
        assert.isFalse(isWorkflowDependsOnElement([]));
        assert.isFalse(isWorkflowDependsOnElement('string'));
      });
    });
  });

  context('isWorkflowParametersElement', function () {
    context('given WorkflowParametersElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowParametersElement();

        assert.isTrue(isWorkflowParametersElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowParametersSubElement extends WorkflowParametersElement {}

        assert.isTrue(isWorkflowParametersElement(new WorkflowParametersSubElement()));
      });
    });

    context('given non WorkflowParametersElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowParametersElement(1));
        assert.isFalse(isWorkflowParametersElement(null));
        assert.isFalse(isWorkflowParametersElement(undefined));
        assert.isFalse(isWorkflowParametersElement({}));
        assert.isFalse(isWorkflowParametersElement([]));
        assert.isFalse(isWorkflowParametersElement('string'));
      });
    });
  });

  context('isWorkflowSuccessActionsElement', function () {
    context('given WorkflowSuccessActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowSuccessActionsElement();

        assert.isTrue(isWorkflowSuccessActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowSuccessActionsSubElement extends WorkflowSuccessActionsElement {}

        assert.isTrue(isWorkflowSuccessActionsElement(new WorkflowSuccessActionsSubElement()));
      });
    });

    context('given non WorkflowSuccessActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowSuccessActionsElement(1));
        assert.isFalse(isWorkflowSuccessActionsElement(null));
        assert.isFalse(isWorkflowSuccessActionsElement(undefined));
        assert.isFalse(isWorkflowSuccessActionsElement({}));
        assert.isFalse(isWorkflowSuccessActionsElement([]));
        assert.isFalse(isWorkflowSuccessActionsElement('string'));
      });
    });
  });

  context('isWorkflowFailureActionsElement', function () {
    context('given WorkflowFailureActionsElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowFailureActionsElement();

        assert.isTrue(isWorkflowFailureActionsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowFailureActionsSubElement extends WorkflowFailureActionsElement {}

        assert.isTrue(isWorkflowFailureActionsElement(new WorkflowFailureActionsSubElement()));
      });
    });

    context('given non WorkflowFailureActionsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowFailureActionsElement(1));
        assert.isFalse(isWorkflowFailureActionsElement(null));
        assert.isFalse(isWorkflowFailureActionsElement(undefined));
        assert.isFalse(isWorkflowFailureActionsElement({}));
        assert.isFalse(isWorkflowFailureActionsElement([]));
        assert.isFalse(isWorkflowFailureActionsElement('string'));
      });
    });
  });

  context('isWorkflowsElement', function () {
    context('given WorkflowsElement instance value', function () {
      specify('should return true', function () {
        const element = new WorkflowsElement();

        assert.isTrue(isWorkflowsElement(element));
      });
    });

    context('given subtype instance value', function () {
      specify('should return true', function () {
        class WorkflowsSubElement extends WorkflowsElement {}

        assert.isTrue(isWorkflowsElement(new WorkflowsSubElement()));
      });
    });

    context('given non WorkflowsElement instance value', function () {
      specify('should return false', function () {
        assert.isFalse(isWorkflowsElement(1));
        assert.isFalse(isWorkflowsElement(null));
        assert.isFalse(isWorkflowsElement(undefined));
        assert.isFalse(isWorkflowsElement({}));
        assert.isFalse(isWorkflowsElement([]));
        assert.isFalse(isWorkflowsElement('string'));
      });
    });
  });
});
