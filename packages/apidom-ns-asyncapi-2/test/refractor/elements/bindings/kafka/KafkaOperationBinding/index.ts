import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractKafkaOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('KafkaOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const kafkaOperationBindingElement = refractKafkaOperationBinding({
          groupId: {},
          clientId: {},
          bindingVersion: '0.1.0',
        });

        expect(sexprs(kafkaOperationBindingElement)).toMatchSnapshot();
      });

      context('given query field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const kafkaOperationBindingElement = refractKafkaOperationBinding({
            groupId: {
              $ref: '#/pointer',
            },
            clientId: {
              $ref: '#/pointer',
            },
            bindingVersion: '0.1.0',
          });

          expect(sexprs(kafkaOperationBindingElement)).toMatchSnapshot();
        });
      });
    });
  });
});
