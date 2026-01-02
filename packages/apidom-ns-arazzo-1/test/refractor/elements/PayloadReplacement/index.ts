import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractPayloadReplacement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('PayloadReplacementElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const payloadReplacementElement = refractPayloadReplacement({
          target: '$.user.id',
          value: '{$response.body#/userId}',
        });

        expect(sexprs(payloadReplacementElement)).toMatchSnapshot();
      });
    });
  });
});
