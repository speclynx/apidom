import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractKafkaChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('KafkaChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const kafkaChannelBindingElement = refractKafkaChannelBinding({
          topic: 'my-specific-topic-name',
          partitions: 20,
          replicas: 3,
          bindingVersion: '0.3.0',
        });

        expect(sexprs(kafkaChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
