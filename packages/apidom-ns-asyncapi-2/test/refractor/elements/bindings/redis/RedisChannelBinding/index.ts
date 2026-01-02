import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractRedisChannelBinding } from '../../../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('RedisChannelBindingElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const redisChannelBindingElement = refractRedisChannelBinding({});

        expect(sexprs(redisChannelBindingElement)).toMatchSnapshot();
      });
    });
  });
});
