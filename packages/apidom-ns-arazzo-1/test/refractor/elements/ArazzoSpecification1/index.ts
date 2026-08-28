import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert, expect } from 'chai';
import { sexprs, toValue } from '@speclynx/apidom-core';
import { isStringElement } from '@speclynx/apidom-datamodel';
import { find } from '@speclynx/apidom-traverse';

import {
  isJSONSchemaElement,
  isSuccessActionElement,
  isStepElement,
  refractArazzoSpecification1,
  ArazzoSpecification1Element,
  StepElement,
  WorkflowElement,
} from '../../../../src/index.ts';

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../fixtures/pet-purchase.json',
);

describe('refractor', function () {
  context('elements', function () {
    context('ArazzoSpecification1Element', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const arazzoSpecification1Element = refractArazzoSpecification1({
          arazzo: '1.1.0',
          $self: 'https://api.example.com/workflows/pet-purchase.arazzo.yaml',
          info: {},
          sourceDescriptions: [{}],
          workflows: [{}],
          components: {},
        });

        expect(sexprs(arazzoSpecification1Element)).toMatchSnapshot();
      });

      context('given Workflow Object inputs with $ref', function () {
        specify('should contain referenced-element meta', function () {
          const arazzoSpecification1Element = refractArazzoSpecification1({
            arazzo: '1.0.1',
            info: {},
            sourceDescriptions: [{}],
            workflows: [{ workflowId: 'wf', inputs: { $ref: '#/components/inputs/input1' } }],
            components: { inputs: { input1: {} } },
          });
          const referencingElement = find(
            arazzoSpecification1Element,
            (path) => isJSONSchemaElement(path.node) && isStringElement(path.node.$ref),
          )?.node;

          assert.strictEqual(
            toValue(referencingElement!.meta.get('referenced-element')),
            'JSONSchema',
          );
        });
      });

      context('given Arazzo 1.1.0 specification example', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
          const arazzoSpecification1Element =
            refractArazzoSpecification1<ArazzoSpecification1Element>(fixture);
          const workflow = arazzoSpecification1Element.workflows!.get(0) as WorkflowElement;
          const steps = workflow.steps!;
          const confirmStep = steps.get(3) as StepElement;

          assert.strictEqual(
            toValue(arazzoSpecification1Element.$self),
            'https://api.example.com/workflows/pet-purchase.arazzo.yaml',
          );
          assert.isTrue(isStepElement(confirmStep));
          assert.strictEqual(toValue(confirmStep.action), 'receive');
          assert.strictEqual(toValue(confirmStep.timeout), 6000);
          assert.isTrue(isSuccessActionElement((steps.get(1) as StepElement).onSuccess!.get(0)));
          expect(sexprs(arazzoSpecification1Element)).toMatchSnapshot();
        });
      });
    });
  });
});
