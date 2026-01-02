import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractMessageExample } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('MessageExampleElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const messageExampleElement = refractMessageExample({
          headers: { 'Content-Type': 'application/json' },
          payload: '{"a":"b"}',
          name: 'example name',
          summary: 'example summary',
        });

        expect(sexprs(messageExampleElement)).toMatchSnapshot();
      });
    });
  });
});
