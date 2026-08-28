import { assert, expect } from 'chai';
import { sexprs, toValue } from '@speclynx/apidom-core';
import { isStringElement } from '@speclynx/apidom-datamodel';
import { find } from '@speclynx/apidom-traverse';

import { isJSONSchemaElement, refractArazzoSpecification1 } from '../../../../src/index.ts';

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
    });
  });
});
