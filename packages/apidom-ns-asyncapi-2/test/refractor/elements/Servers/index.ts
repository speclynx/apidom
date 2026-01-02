import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractServers } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ServersElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const serversElement = refractServers({
          dev: {},
          staging: {},
          production: {
            $ref: '#/path/to/production/server',
          },
        });

        expect(sexprs(serversElement)).toMatchSnapshot();
      });
    });
  });
});
