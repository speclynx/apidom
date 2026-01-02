import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractRedisMessageBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RedisMessageBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const redisMessageBindingElement = refractRedisMessageBinding({});

        expect(sexprs(redisMessageBindingElement)).toMatchSnapshot();
      });
    });
  });
});
