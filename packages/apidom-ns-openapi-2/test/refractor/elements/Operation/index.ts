import { assert, expect } from 'chai';
import { ArrayElement, ObjectElement, includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractOperation, OperationElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OperationElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const operationElement = refractOperation({
          tags: ['tag1', 'tag2'],
          summary: 'operation-summary',
          description: 'operation-description',
          externalDocs: {},
          operationId: 'operation-operationId',
          consumes: ['application/json'],
          produces: ['application/json'],
          parameters: [{}, { $ref: '#/parameters/parameter1' }],
          responses: {},
          schemes: ['http', 'https'],
          deprecated: true,
          security: [{}],
        });

        expect(sexprs(operationElement)).toMatchSnapshot();
      });

      specify('should support specification extensions', function () {
        const operationElement = refractOperation({
          summary: 'operation-summary',
          'x-extension': 'extension',
        }) as OperationElement;

        assert.isFalse(
          includesClasses(operationElement.getMember('summary') as any, [
            'specification-extension',
          ]),
        );
        assert.isTrue(
          includesClasses(operationElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });

      context('given array fields carrying style information', function () {
        specify('should transfer style to the refracted elements', function () {
          const style = { yaml: { styleGroup: 'Flow' } };
          const fields = ['tags', 'consumes', 'produces', 'schemes'];
          const operation = new ObjectElement({ summary: 'operation-summary' });
          for (const field of fields) {
            const array = new ArrayElement(['value1', 'value2']);
            array.style = { ...style };
            operation.set(field, array);
          }

          const operationElement = refractOperation(operation) as OperationElement;

          for (const field of fields) {
            assert.deepEqual((operationElement.get(field) as ArrayElement).style, style, field);
          }
        });
      });
    });
  });
});
