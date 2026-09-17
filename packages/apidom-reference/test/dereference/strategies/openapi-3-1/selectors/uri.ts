import { assert } from 'chai';
import { Element, ObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractOpenApi3_1 } from '@speclynx/apidom-ns-openapi-3-1';

import {
  evaluate,
  locate,
  EvaluationJsonSchemaUriError,
} from '../../../../../src/dereference/strategies/openapi-3-1/selectors/uri.ts';

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('selectors', function () {
        context('uri', function () {
          const document = refractOpenApi3_1({
            openapi: '3.1.0',
            components: {
              schemas: {
                Pet: { $id: 'https://example.com/pet', type: 'object' },
                Profile: { $id: 'profile.json', type: 'object' },
              },
            },
          }) as Element;

          specify('should resolve absolute $id without options', function () {
            const result = evaluate('https://example.com/pet', document);

            assert.deepEqual(toValue(result), { $id: 'https://example.com/pet', type: 'object' });
          });

          specify('should resolve relative $id against baseURI option', function () {
            const result = evaluate('https://example.com/docs/profile.json', document, {
              baseURI: 'https://example.com/docs/root.json',
            });

            assert.deepEqual(toValue(result), { $id: 'profile.json', type: 'object' });
          });

          specify('should reuse the index across calls', function () {
            const index = new WeakMap();

            evaluate('https://example.com/pet', document, { index });

            assert.isTrue(index.has(document));
            assert.lengthOf(index.get(document)!, 2);
          });

          specify('should throw when no schema matches', function () {
            assert.throws(
              () => evaluate('https://example.com/unknown', document),
              EvaluationJsonSchemaUriError,
            );
          });

          context('locate', function () {
            const nested = refractOpenApi3_1({
              openapi: '3.1.0',
              components: {
                schemas: {
                  User: {
                    $id: './users/',
                    properties: {
                      profile: {
                        $id: 'profile.json',
                        $defs: { Avatar: { $anchor: 'avatar', properties: { url: {} } } },
                      },
                    },
                  },
                },
              },
            }) as Element;
            const options = { baseURI: 'https://example.com/docs/root.json' };

            specify('should report enclosing $ids of schema matched by $id', function () {
              const location = locate(
                'https://example.com/docs/users/profile.json',
                nested,
                options,
              );

              assert.strictEqual(
                toValue((location.element as ObjectElement).get('$id')),
                'profile.json',
              );
              assert.deepEqual(location.ancestorSchema$ids, ['./users/']);
            });

            specify('should report enclosing $ids of fragment addressed by pointer', function () {
              const location = locate(
                'https://example.com/docs/users/profile.json#/$defs/Avatar/properties/url',
                nested,
                options,
              );

              assert.deepEqual(toValue(location.element), {});
              assert.deepEqual(location.ancestorSchema$ids, ['./users/', 'profile.json']);
            });

            specify('should report enclosing $ids of fragment addressed by $anchor', function () {
              const location = locate(
                'https://example.com/docs/users/profile.json#avatar',
                nested,
                options,
              );

              assert.strictEqual(
                toValue((location.element as ObjectElement).get('$anchor')),
                'avatar',
              );
              assert.deepEqual(location.ancestorSchema$ids, ['./users/', 'profile.json']);
            });
          });
        });
      });
    });
  });
});
