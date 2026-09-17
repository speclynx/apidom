import { assert } from 'chai';
import { Element } from '@speclynx/apidom-datamodel';
import { find, Path } from '@speclynx/apidom-traverse';
import { refractOpenApi3_1, SchemaElement } from '@speclynx/apidom-ns-openapi-3-1';

import {
  collectSchema$ids,
  resolveSchema$ids,
  resolveSchemaBaseURI,
  resolveSchema$refField,
  resolveSchema$idField,
} from '../../../../src/dereference/strategies/openapi-3-1/util.ts';

const baseURI = 'https://example.com/docs/root.json';

const pathOf = (root: Element, pointer: string): Path<Element> =>
  find(root, (path) => path.getPathKeys().join('/') === pointer)!;

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('util', function () {
        const document = refractOpenApi3_1({
          openapi: '3.1.0',
          components: {
            schemas: {
              User: {
                $id: './users/',
                type: 'object',
                properties: {
                  profile: {
                    $id: 'profile.json',
                    properties: { avatar: { $ref: '#/$defs/Avatar' } },
                  },
                  pet: { $ref: '../pets/pet.json#/$defs/Pet' },
                },
              },
            },
          },
        }) as Element;
        const userPath = pathOf(document, 'components/schemas/User');
        const profilePath = pathOf(document, 'components/schemas/User/properties/profile');
        const avatarPath = pathOf(
          document,
          'components/schemas/User/properties/profile/properties/avatar',
        );
        const petPath = pathOf(document, 'components/schemas/User/properties/pet');

        context('collectSchema$ids', function () {
          specify('should collect $ids of enclosing schemas outermost first', function () {
            assert.deepEqual(collectSchema$ids(avatarPath), ['./users/', 'profile.json']);
          });

          specify('should include the $id of the schema itself', function () {
            assert.deepEqual(collectSchema$ids(userPath), ['./users/']);
          });

          specify('should return empty list for null path', function () {
            assert.deepEqual(collectSchema$ids(null), []);
          });
        });

        context('resolveSchema$ids', function () {
          specify('should resolve each $id against the previous one', function () {
            assert.strictEqual(
              resolveSchema$ids(baseURI, ['./users/', 'profile.json#frag']),
              'https://example.com/docs/users/profile.json',
            );
          });

          specify('should return base URI for empty chain', function () {
            assert.strictEqual(resolveSchema$ids(baseURI, []), baseURI);
          });
        });

        context('resolveSchemaBaseURI', function () {
          specify('should resolve base URI of nested schema', function () {
            assert.strictEqual(
              resolveSchemaBaseURI(baseURI, avatarPath),
              'https://example.com/docs/users/profile.json',
            );
          });
        });

        context('resolveSchema$refField', function () {
          specify('should resolve $ref against enclosing $ids', function () {
            assert.strictEqual(
              resolveSchema$refField(baseURI, petPath),
              'https://example.com/docs/pets/pet.json#/$defs/Pet',
            );
          });

          specify('should keep fragment of $ref resolved against own $id chain', function () {
            assert.strictEqual(
              resolveSchema$refField(baseURI, avatarPath),
              'https://example.com/docs/users/profile.json#/$defs/Avatar',
            );
          });

          specify('should return undefined when $ref is not defined', function () {
            assert.isUndefined(resolveSchema$refField(baseURI, userPath));
          });

          specify('should honor $id assigned after refraction', function () {
            const assigned = refractOpenApi3_1({
              openapi: '3.1.0',
              components: { schemas: { Pet: { properties: { tag: { $ref: './tag.json' } } } } },
            }) as Element;
            (pathOf(assigned, 'components/schemas/Pet').node as SchemaElement).set(
              '$id',
              'schemas/pet.json',
            );

            assert.strictEqual(
              resolveSchema$refField(
                baseURI,
                pathOf(assigned, 'components/schemas/Pet/properties/tag'),
              ),
              'https://example.com/docs/schemas/tag.json',
            );
          });

          specify('should resolve $ref of programmatically created schema', function () {
            const schemaElement = new SchemaElement({ $ref: './pet.json' });
            const rootPath = new Path<Element>(schemaElement, undefined, null, undefined, false);

            assert.strictEqual(
              resolveSchema$refField(baseURI, rootPath),
              'https://example.com/docs/pet.json',
            );
          });
        });

        context('resolveSchema$idField', function () {
          specify('should resolve canonical URI of schema with $id', function () {
            assert.strictEqual(
              resolveSchema$idField(baseURI, profilePath),
              'https://example.com/docs/users/profile.json',
            );
          });

          specify('should return undefined when $id is not defined', function () {
            assert.isUndefined(resolveSchema$idField(baseURI, petPath));
          });

          specify('should resolve $id of programmatically created schema', function () {
            const schemaElement = new SchemaElement({ $id: 'pet.json' });
            const rootPath = new Path<Element>(schemaElement, undefined, null, undefined, false);

            assert.strictEqual(
              resolveSchema$idField(baseURI, rootPath),
              'https://example.com/docs/pet.json',
            );
          });
        });
      });
    });
  });
});
