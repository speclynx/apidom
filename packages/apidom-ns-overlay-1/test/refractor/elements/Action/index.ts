import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { refractAction, ActionElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ActionElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const actionElement = refractAction({
          target: '$.paths[*].get',
          description: 'Add a description to all GET operations',
          update: {
            description: 'This is a GET operation',
          },
        });

        expect(sexprs(actionElement)).toMatchSnapshot();
      });

      context('given action with remove field', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const actionElement = refractAction({
            target: '$.paths./old-path',
            remove: true,
          });

          expect(sexprs(actionElement)).toMatchSnapshot();
        });
      });

      context('given action with copy field', function () {
        specify('should refract to semantic ApiDOM tree', function () {
          const actionElement = refractAction({
            target: '$.paths./new-path.get.description',
            copy: '$.paths./old-path.get.description',
          });

          expect(sexprs(actionElement)).toMatchSnapshot();
        });
      });

      context('given generic ApiDOM element', function () {
        let actionElement: ActionElement;

        beforeEach(function () {
          actionElement = refractAction(
            new ObjectElement({}, { classes: ['example'] }, { attr: true }),
          );
        });

        specify('should refract to semantic ApiDOM tree', function () {
          expect(sexprs(actionElement)).toMatchSnapshot();
        });

        specify('should deepmerge meta', function () {
          assert.deepEqual(actionElement.classes, ['action', 'example']);
        });

        specify('should deepmerge attributes', function () {
          assert.isTrue(actionElement.attributes.get('attr')?.equals(true));
        });
      });
    });
  });
});
