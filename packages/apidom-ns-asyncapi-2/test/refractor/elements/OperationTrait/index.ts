import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractOperationTrait } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('OperationTraitElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const operationTraitElement = refractOperationTrait({
          operationId: 'operation-trait-operationId',
          summary: 'operation-trait-summary',
          description: 'operation-trait-description',
          security: [{ petstore_auth: [] }],
          tags: [],
          externalDocs: {},
        });

        expect(sexprs(operationTraitElement)).toMatchSnapshot();
      });

      context('given bindings field of type OperationBindingsElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationTraitElement = refractOperationTrait({
            bindings: {},
          });

          expect(sexprs(operationTraitElement)).toMatchSnapshot();
        });
      });

      context('given bindings field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const operationTraitElement = refractOperationTrait({
            bindings: {
              $ref: '#/path/to/bindings',
            },
          });

          expect(sexprs(operationTraitElement)).toMatchSnapshot();
        });
      });
    });
  });
});
