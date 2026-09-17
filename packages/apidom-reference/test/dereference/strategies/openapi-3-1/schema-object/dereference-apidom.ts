import path from 'node:path';
import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import {
  SchemaElement,
  PathItemElement,
  mediaTypes,
  isSchemaElement,
} from '@speclynx/apidom-ns-openapi-3-1';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { fileURLToPath } from 'node:url';

import { parse, dereferenceApiDOM } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('dereference', function () {
  context('strategies', function () {
    context('openapi-3-1', function () {
      context('Schema Object', function () {
        context(
          'given single SchemaElement passed to dereferenceApiDOM with internal references',
          function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'internal-only', 'root.json');

            specify('should dereference', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<SchemaElement>(
                parseResult.api,
                '/components/schemas/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: `${fixturePath}#/components/schemas/User/properties/profile` },
              });

              assert.isTrue(isSchemaElement(dereferenced));
            });

            specify('should dereference and contain metadata about origin', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<SchemaElement>(
                parseResult.api,
                '/components/schemas/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: `${fixturePath}#/components/schemas/User/properties/profile` },
              });

              assert.match(
                toValue(dereferenced.meta.get('ref-origin')) as string,
                /internal-only\/root\.json$/,
              );
            });
          },
        );

        context(
          'given single SchemaElement passed to dereferenceApiDOM with external references',
          function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'external-only', 'root.json');

            specify('should dereference', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<SchemaElement>(
                parseResult.api,
                '/components/schemas/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: fixturePath },
              });

              assert.isTrue(isSchemaElement(dereferenced));
            });

            specify('should dereference and contain metadata about origin', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const pathItemElement = evaluate<PathItemElement>(
                parseResult.api,
                '/components/schemas/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(pathItemElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: fixturePath },
              });

              assert.match(
                toValue(dereferenced.meta.get('ref-origin')) as string,
                /external-only\/ex\.json$/,
              );
            });
          },
        );

        context(
          'given single SchemaElement enclosed by $id keyword passed to dereferenceApiDOM',
          function () {
            const fixturePath = path.join(__dirname, 'fixtures', '$id-uri-enclosing', 'root.json');

            // the fragment is detached from the document, so the enclosing $id is
            // only known through the refraction-time metadata
            specify('should resolve $ref against the enclosing $id', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<SchemaElement>(
                parseResult.api,
                '/components/schemas/User/properties/profile',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: fixturePath },
              });

              assert.deepEqual(toValue(dereferenced), {
                type: 'object',
                properties: { avatar: { type: 'string' } },
              });
            });
          },
        );

        context(
          'given single SchemaElement with relative $id enclosed by $id keyword passed to dereferenceApiDOM',
          function () {
            const fixturePath = path.join(
              __dirname,
              'fixtures',
              '$id-uri-enclosing-relative',
              'root.json',
            );

            // the fragment's own $id resolves against the enclosing $id known only
            // through the refraction-time metadata; the $ref resolves against that
            specify('should resolve $ref within the fragment $id resource', async function () {
              const parseResult = await parse(fixturePath, {
                parse: { mediaType: mediaTypes.latest('json') },
              });
              const schemaElement = evaluate<SchemaElement>(
                parseResult.api,
                '/components/schemas/Root/$defs/Identified',
              );
              const dereferenced = await dereferenceApiDOM(schemaElement, {
                parse: { mediaType: mediaTypes.latest('json') },
                resolve: { baseURI: fixturePath },
              });

              assert.deepEqual(toValue(dereferenced), {
                type: 'integer',
                $id: 'identified',
                $defs: { Inner: { type: 'integer' } },
              });
            });
          },
        );
      });
    });
  });
});
