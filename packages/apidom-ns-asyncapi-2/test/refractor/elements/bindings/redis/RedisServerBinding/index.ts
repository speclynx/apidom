import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { RedisServerBindingElement } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RedisServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const redisServerBindingElement = RedisServerBindingElement.refract({});

        expect(sexprs(redisServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
