import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractAsyncApi2 } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('AsyncApi2Element', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const asyncApiElement = refractAsyncApi2({
          asyncapi: '2.`.0',
          id: 'urn:com:smartylighting:streetlights:server',
          info: {},
          servers: {},
          defaultContentType: 'application/json',
          channels: {},
          components: {},
          tags: [],
          externalDocs: {},
        });

        expect(sexprs(asyncApiElement)).toMatchSnapshot();
      });
    });
  });
});
