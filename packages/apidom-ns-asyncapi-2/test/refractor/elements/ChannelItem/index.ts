import { expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';

import { refractChannelItem } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ChannelItemElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const channelItemElement = refractChannelItem({
          $ref: '#/path/to/channel-item',
          description: 'channel-item-description',
          servers: ['server1', 'server2'],
          subscribe: {},
          publish: {},
          parameters: {},
        });

        expect(sexprs(channelItemElement)).toMatchSnapshot();
      });

      context('given bindings field of type ChannelBindingsElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const channelItemElement = refractChannelItem({
            bindings: {},
          });

          expect(sexprs(channelItemElement)).toMatchSnapshot();
        });
      });

      context('given bindings field of type ReferenceElement', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const channelItemElement = refractChannelItem({
            bindings: {
              $ref: '#/path/to/bindings',
            },
          });

          expect(sexprs(channelItemElement)).toMatchSnapshot();
        });
      });
    });
  });
});
