import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractRedisOperationBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RedisOperationBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const redisOperationBindingElement = refractRedisOperationBinding({});

        expect(sexprs(redisOperationBindingElement)).toMatchSnapshot();
      });
    });
  });
});
