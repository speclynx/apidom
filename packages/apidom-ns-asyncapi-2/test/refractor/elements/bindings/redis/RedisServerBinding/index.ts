import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractRedisServerBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RedisServerBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const redisServerBindingElement = refractRedisServerBinding({});

        expect(sexprs(redisServerBindingElement)).toMatchSnapshot();
      });
    });
  });
});
