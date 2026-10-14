import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractReusableAction } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ReusableActionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const reusableActionElement = refractReusableAction({
          description: 'Removes internal paths',
          fields: {
            description: 'Remove the path',
            remove: true,
          },
          'x-extension': 'extension',
        });

        expect(sexprs(reusableActionElement)).toMatchSnapshot();
      });
    });
  });
});
