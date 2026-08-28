import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import {
  includesClasses,
  hasElementSourceMap,
  Element,
  ObjectElement,
  ArrayElement,
} from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  ArazzoSpecification1Element,
  refractArazzoSpecification1,
  isComponentsElement,
  isCriterionElement,
  isFailureActionElement,
  isInfoElement,
  isJSONSchemaElement,
  isParameterElement,
  isPayloadReplacementElement,
  isRequestBodyElement,
  isSourceDescriptionElement,
  isStepElement,
  isSuccessActionElement,
  isWorkflowElement,
} from '../../../../src/index.ts';

const at = (element: Element, ...path: Array<string | number>): Element | undefined =>
  path.reduce<Element | undefined>(
    (current, key) =>
      typeof key === 'number'
        ? (current as ArrayElement | undefined)?.get(key)
        : (current as ObjectElement | undefined)?.get(key),
    element,
  );

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      info:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isInfoElement(at(arazzoElement, 'info'));

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of SourceDescriptionsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      sourceDescriptions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'sourceDescriptions')!, [
      'source-descriptions',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of SourceDescriptionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      sourceDescriptions:
        -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isSourceDescriptionElement(
      at(arazzoElement, 'sourceDescriptions', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'workflows')!, ['workflows']);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isWorkflowElement(at(arazzoElement, 'workflows', 0));

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Workflow.inputs JSONSchemaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - inputs:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isJSONSchemaElement(at(arazzoElement, 'workflows', 0, 'inputs'));

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Workflow.inputs.properties.* JSONSchemaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - inputs:
            properties:
              petId:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isJSONSchemaElement(
      at(arazzoElement, 'workflows', 0, 'inputs', 'properties', 'petId'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowDependsOnElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - dependsOn:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'workflows', 0, 'dependsOn')!, [
      'workflow-depends-on',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowStepsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'workflows', 0, 'steps')!, [
      'workflow-steps',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isStepElement(at(arazzoElement, 'workflows', 0, 'steps', 0));

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepParametersElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - parameters:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'parameters')!,
      ['step-parameters'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Step.parameters.* ParameterElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - parameters:
                -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isParameterElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'parameters', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of RequestBodyElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - requestBody:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isRequestBodyElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'requestBody'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of RequestBodyReplacementsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - requestBody:
                replacements:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'requestBody', 'replacements')!,
      ['request-body-replacements'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of PayloadReplacementElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - requestBody:
                replacements:
                  -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isPayloadReplacementElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'requestBody', 'replacements', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepSuccessCriteriaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - successCriteria:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'successCriteria')!,
      ['step-success-criteria'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Step.successCriteria.* CriterionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - successCriteria:
                -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isCriterionElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'successCriteria', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepOnSuccessElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onSuccess:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onSuccess')!,
      ['step-on-success'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Step.onSuccess.* SuccessActionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onSuccess:
                -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isSuccessActionElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onSuccess', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of SuccessActionParametersElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onSuccess:
                - parameters:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onSuccess', 0, 'parameters')!,
      ['success-action-parameters'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of SuccessActionCriteriaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onSuccess:
                - criteria:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onSuccess', 0, 'criteria')!,
      ['success-action-criteria'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepOnFailureElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onFailure:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onFailure')!,
      ['step-on-failure'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Step.onFailure.* FailureActionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onFailure:
                -
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isFailureActionElement(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onFailure', 0),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of FailureActionParametersElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onFailure:
                - parameters:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onFailure', 0, 'parameters')!,
      ['failure-action-parameters'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of FailureActionCriteriaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - onFailure:
                - criteria:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'onFailure', 0, 'criteria')!,
      ['failure-action-criteria'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepOutputsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - outputs:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'outputs')!,
      ['step-outputs'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of StepDependsOnElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - steps:
            - dependsOn:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'steps', 0, 'dependsOn')!,
      ['step-depends-on'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowSuccessActionsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - successActions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'successActions')!,
      ['workflow-success-actions'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowFailureActionsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - failureActions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(
      at(arazzoElement, 'workflows', 0, 'failureActions')!,
      ['workflow-failure-actions'],
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowOutputsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - outputs:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'workflows', 0, 'outputs')!, [
      'workflow-outputs',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of WorkflowParametersElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      workflows:
        - parameters:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'workflows', 0, 'parameters')!, [
      'workflow-parameters',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of ComponentsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isComponentsElement(at(arazzoElement, 'components'));

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of ComponentsInputsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        inputs:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'components', 'inputs')!, [
      'components-inputs',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Components.inputs.* JSONSchemaElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        inputs:
          petInput:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isJSONSchemaElement(
      at(arazzoElement, 'components', 'inputs', 'petInput'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of ComponentsParametersElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        parameters:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'components', 'parameters')!, [
      'components-parameters',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Components.parameters.* ParameterElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        parameters:
          petId:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isParameterElement(
      at(arazzoElement, 'components', 'parameters', 'petId'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of ComponentsSuccessActionsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        successActions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'components', 'successActions')!, [
      'components-success-actions',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Components.successActions.* SuccessActionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        successActions:
          notify:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isSuccessActionElement(
      at(arazzoElement, 'components', 'successActions', 'notify'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of ComponentsFailureActionsElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        failureActions:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = includesClasses(at(arazzoElement, 'components', 'failureActions')!, [
      'components-failure-actions',
    ]);

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given empty value instead of Components.failureActions.* FailureActionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      components:
        failureActions:
          retry:
    `;
    const apiDOM = await parse(yamlDefinition);
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const isSemanticElement = isFailureActionElement(
      at(arazzoElement, 'components', 'failureActions', 'retry'),
    );

    expect(sexprs(arazzoElement)).toMatchSnapshot();
    expect(isSemanticElement).to.be.true;
  });
});

describe('given Arazzo definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
      arazzo: 1.1.0
      info:
    `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const arazzoElement = refractArazzoSpecification1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as ArazzoSpecification1Element;
    const { info: infoValue } = arazzoElement;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(19);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(19);
  });
});
