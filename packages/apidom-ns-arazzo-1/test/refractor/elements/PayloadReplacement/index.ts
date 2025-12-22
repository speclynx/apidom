import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { PayloadReplacementElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PayloadReplacementElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const payloadReplacementElement = PayloadReplacementElement.refract({
          target: '$.user.id',
          value: '{$response.body#/userId}',
        });

        expect(sexprs(payloadReplacementElement)).toMatchSnapshot();
      });
    });
  });
});
