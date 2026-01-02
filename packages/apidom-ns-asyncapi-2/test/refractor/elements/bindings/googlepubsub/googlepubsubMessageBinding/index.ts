import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractGooglepubsubMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('GooglepubsubChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const googlepubsubMessageBindingElement = refractGooglepubsubMessageBinding({
          bindingVersion: '0.1.0',
          attributes: {},
          orderingKey: '',
          schema: {
            name: 'projects/your-project/schemas/message-avro',
            type: 'avro',
          },
        });

        expect(sexprs(googlepubsubMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
