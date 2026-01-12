import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { find } from '@speclynx/apidom-traverse';
import { isElement } from '@speclynx/apidom-datamodel';

import { isJSONSchemaElement, refractJSONSchema } from '../../../../src/index.ts';

describe('refractor', function () {
  context('elements', function () {
    context('JSONSchemaElement', function () {
      context('$id keyword in embedded resources', function () {
        context('given JSONSchema Object without $id keyword', function () {
          specify('should have empty ancestorsSchemaIdentifiers', function () {
            const jsonSchemaElement = refractJSONSchema({});
            const actual = toValue(jsonSchemaElement.meta.get('ancestorsSchemaIdentifiers'));

            assert.deepEqual(actual, []);
          });
        });

        context('given JSONSchema Object with arbitrary fields boundaries', function () {
          specify('should annotate Schema($anchor=1) with ancestorsSchemaIdentifiers', function () {
            const jsonSchemaElement = refractJSONSchema({
              $id: './nested/',
              type: 'object',
              properties: {
                profile: {
                  $anchor: '1',
                  $ref: './ex.json',
                },
              },
            });
            const actual = toValue(jsonSchemaElement.meta.get('ancestorsSchemaIdentifiers'));

            assert.deepEqual(actual, ['./nested/']);
          });
        });

        context('given JSONSchema Object with inner Schemas', function () {
          let jsonSchemaElement: any;

          beforeEach(function () {
            jsonSchemaElement = refractJSONSchema({
              $anchor: '1',
              type: 'object',
              oneOf: [
                {
                  $id: '$id1',
                  $anchor: '2',
                  type: 'number',
                  contains: { $id: '$id2', $anchor: '3', type: 'object' },
                },
              ],
              contains: {
                $anchor: '4',
                type: 'string',
              },
            });
          });

          specify(
            'should annotate JSONSchema Object($anchor=1) with ancestorsSchemaIdentifiers',
            function () {
              const foundJsonSchemaElement = find(
                jsonSchemaElement,
                (e) => isJSONSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('1'),
              );
              const actual = toValue(foundJsonSchemaElement?.meta.get('ancestorsSchemaIdentifiers'));

              assert.deepEqual(actual, []);
            },
          );

          specify(
            'should annotate JSONSchema Object($anchor=2) with ancestorsSchemaIdentifiers',
            function () {
              const foundJsonSchemaElement = find(
                jsonSchemaElement,
                (e) => isJSONSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('2'),
              );
              const actual = toValue(foundJsonSchemaElement?.meta.get('ancestorsSchemaIdentifiers'));

              assert.deepEqual(actual, ['$id1']);
            },
          );

          specify(
            'should annotate JSONSchema Object($anchor=3) with ancestorsSchemaIdentifiers',
            function () {
              const foundJsonSchemaElement = find(
                jsonSchemaElement,
                (e) => isJSONSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('3'),
              );
              const actual = toValue(foundJsonSchemaElement?.meta.get('ancestorsSchemaIdentifiers'));

              assert.deepEqual(actual, ['$id1', '$id2']);
            },
          );

          specify(
            'should not annotate JSONSchema Object($anchor=4) with ancestorsSchemaIdentifiers',
            function () {
              const foundJsonSchemaElement = find(
                jsonSchemaElement,
                (e) => isJSONSchemaElement(e) && isElement(e.$anchor) && e.$anchor.equals('4'),
              );
              const actual = toValue(foundJsonSchemaElement?.meta.get('ancestorsSchemaIdentifiers'));

              assert.deepEqual(actual, []);
            },
          );
        });
      });
    });
  });
});
