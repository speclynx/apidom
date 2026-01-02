import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractServerVariable } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ServerVariableElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const serverVariableElement = refractServerVariable({
          enum: ['val1', 'val2'],
          default: 'val1',
          description: 'server-variable-description',
        });

        expect(sexprs(serverVariableElement)).toMatchSnapshot();
      });
    });
  });
});
