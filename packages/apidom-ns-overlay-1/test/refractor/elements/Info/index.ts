import { assert, expect } from 'chai';
import { sexprs } from '@speclynx/apidom-core';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { refractInfo, InfoElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('InfoElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const infoElement = refractInfo({
          title: 'Overlay to add documentation links',
          description: 'This overlay adds documentation links to the target document.',
          version: '1.0.0',
        });

        expect(sexprs(infoElement)).toMatchSnapshot();
      });

      context('given generic ApiDOM element', function () {
        let infoElement: InfoElement;

        beforeEach(function () {
          infoElement = refractInfo(
            new ObjectElement({}, { classes: ['example'] }, { attr: true }),
          );
        });

        specify('should refract to semantic ApiDOM tree', function () {
          expect(sexprs(infoElement)).toMatchSnapshot();
        });

        specify('should deepmerge meta', function () {
          assert.deepEqual(infoElement.classes, ['info', 'example']);
        });

        specify('should deepmerge attributes', function () {
          assert.isTrue(infoElement.attributes.get('attr')?.equals(true));
        });
      });
    });
  });
});
