import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractServer } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ServerElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const serverElement = refractServer({
          url: '{username}.gigantic-server.com',
          description: 'The production API server',
          variables: {
            username: {},
          },
        });

        expect(sexprs(serverElement)).toMatchSnapshot();
      });
    });
  });
});
