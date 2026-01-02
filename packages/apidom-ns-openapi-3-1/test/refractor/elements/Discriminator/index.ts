import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractDiscriminator } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('DiscriminatorElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const discriminatorElement = refractDiscriminator({
          propertyName: 'prop-name',
          mapping: {
            string: 'string',
          },
        });

        expect(sexprs(discriminatorElement)).toMatchSnapshot();
      });
    });
  });
});
