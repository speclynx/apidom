import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { ArrayElement, ObjectElement } from '@speclynx/apidom-datamodel';

import { refractOperation } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OperationElement', function () {
      context('given requestBody field of type RequestBodyElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            tags: ['tag1', 'tag2'],
            summary: 'operation-summary',
            description: 'operation-description',
            externalDocs: {},
            operationId: 'operation-operationId',
            parameters: [{}, { $ref: '#/components/parameters/Parameter1' }],
            requestBody: {},
            responses: {},
            callbacks: {
              callback1: {},
              callback2: { $ref: '#/components/callbacks/Callback1' },
            },
            deprecated: true,
            security: [{}],
            servers: [{}],
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given requestBody field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            tags: ['tag1', 'tag2'],
            summary: 'operation-summary',
            description: 'operation-description',
            externalDocs: {},
            operationId: 'operation-operationId',
            parameters: [{}, { $ref: '#/components/parameters/Parameter1' }],
            requestBody: { $ref: '#/components/requestBodies/RequestBody' },
            responses: {},
            callbacks: {
              callback1: {},
              callback2: { $ref: '#/components/callbacks/Callback1' },
            },
            deprecated: true,
            security: [{}],
            servers: [{}],
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given tags field carrying style information', function () {
        specify('should transfer style to the refracted element', function () {
          const tags = new ArrayElement(['tag1', 'tag2']);
          tags.style = { yaml: { styleGroup: 'Flow' } };
          const operation = new ObjectElement({ summary: 'operation-summary' });
          operation.set('tags', tags);

          const operationElement = refractOperation(operation);

          assert.deepEqual(operationElement.tags?.style, { yaml: { styleGroup: 'Flow' } });
        });
      });
    });
  });
});
