import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOperation } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OperationElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const operationElement = refractOperation({
          operationId: 'operation-operationId',
          summary: 'operation-summary',
          description: 'operation-description',
          security: [{ user_pass: [] }],
          tags: [],
          externalDocs: {},
        });

        expect(sexprs(operationElement)).toMatchSnapshot();
      });

      context('given bindings field of type OperationBindingsElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            bindings: {},
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given bindings field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            bindings: {
              $ref: '#/path/to/bindings',
            },
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given traits field contains list of type OperationTraitElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            traits: [{}],
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given traits field contains list of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            traits: [
              {
                $ref: '#/path/to/operation-trait',
              },
            ],
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given message field of type MessageElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            message: {},
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given message field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            message: { $ref: '#/path/to/message' },
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });

      context('given message field of `oneOf` shape', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationElement = refractOperation({
            message: {
              oneOf: [{}, { $ref: '#/path/to/message' }],
            },
          });

          expect(sexprs(operationElement)).toMatchSnapshot();
        });
      });
    });
  });
});
