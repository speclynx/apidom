import { assert } from 'chai';
import { Element, ObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractOpenApi3_1 } from '@speclynx/apidom-ns-openapi-3-1';
import { JSONPointerEvaluateError } from '@speclynx/apidom-json-pointer';

import { locate } from '../../../../../src/dereference/strategies/openapi-3-1/selectors/json-pointer.ts';

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('selectors', function () {
        context('json-pointer', function () {
          const document = refractOpenApi3_1({
            openapi: '3.1.0',
            components: {
              schemas: {
                User: {
                  $id: './users/',
                  properties: { profile: { $id: 'profile.json', properties: { avatar: {} } } },
                },
              },
            },
          }) as Element;

          specify('should locate element and $ids of the schemas walked through', function () {
            const location = locate(
              document,
              '/components/schemas/User/properties/profile/properties/avatar',
            );

            assert.deepEqual(toValue(location.element), {});
            assert.deepEqual(location.ancestorSchema$ids, ['./users/', 'profile.json']);
          });

          specify('should exclude the $id of the located element', function () {
            const location = locate(document, '/components/schemas/User/properties/profile');

            assert.strictEqual(
              toValue((location.element as ObjectElement).get('$id')),
              'profile.json',
            );
            assert.deepEqual(location.ancestorSchema$ids, ['./users/']);
          });

          specify('should locate the root with empty pointer', function () {
            const location = locate(document, '');

            assert.strictEqual(location.element, document);
            assert.deepEqual(location.ancestorSchema$ids, []);
          });

          specify('should throw on invalid pointer', function () {
            assert.throws(() => locate(document, '/components/unknown'), JSONPointerEvaluateError);
          });
        });
      });
    });
  });
});
