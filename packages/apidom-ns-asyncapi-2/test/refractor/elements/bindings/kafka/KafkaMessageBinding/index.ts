import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractKafkaMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('KafkaMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const kafkaMessageBindingElement = refractKafkaMessageBinding({
          key: {},
          schemaIdLocation: 'payload',
          schemaIdPayloadEncoding: '4',
          bindingVersion: '0.3.0',
        });

        expect(sexprs(kafkaMessageBindingElement)).toMatchSnapshot();
      });

      context('given query field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const kafkaMessageBindingElement = refractKafkaMessageBinding({
            key: {
              $ref: '#/pointer',
            },
            schemaIdLocation: 'payload',
            schemaIdPayloadEncoding: '4',
            bindingVersion: '0.3.0',
          });

          expect(sexprs(kafkaMessageBindingElement)).toMatchSnapshot();
        });
      });
    });
  });
});
