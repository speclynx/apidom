import { assert, expect } from 'chai';
import { ObjectElement, includesClasses } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

import { refractContact, ContactElement } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('ContactElement', function () {
      specify('should refract to semantic ApiDOM tree', function () {
        const contactElement = refractContact({
          name: 'API Support',
          url: 'https://www.example.com/support',
          email: 'support@example.com',
        });

        expect(sexprs(contactElement)).toMatchSnapshot();
      });

      context('given generic ApiDOM element', function () {
        let contactElement: ContactElement;

        beforeEach(function () {
          contactElement = refractContact(
            new ObjectElement(
              {
                name: 'API Support',
                url: 'https://www.example.com/support',
                email: 'support@example.com',
              },
              { classes: ['example'] },
              { attr: true },
            ),
          );
        });

        specify('should refract to semantic ApiDOM tree', function () {
          expect(sexprs(contactElement)).toMatchSnapshot();
        });

        specify('should deepmerge meta', function () {
          assert.isTrue(contactElement.classes.includes('example'));
        });

        specify('should deepmerge attributes', function () {
          assert.isTrue(contactElement.attributes.get('attr')?.equals(true));
        });
      });

      specify('should support specification extensions', function () {
        const contactElement = refractContact({
          name: 'API support',
          'x-extension': 'extension',
        });

        assert.isFalse(
          includesClasses(contactElement.getMember('name') as any, ['specification-extension']),
        );
        assert.isTrue(
          includesClasses(contactElement.getMember('x-extension') as any, [
            'specification-extension',
          ]),
        );
      });
    });
  });
});
