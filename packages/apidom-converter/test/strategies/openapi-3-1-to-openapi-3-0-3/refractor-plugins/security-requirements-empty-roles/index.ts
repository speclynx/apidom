import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mediaTypes as openAPI31MediaTypes } from '@speclynx/apidom-parser-adapter-openapi-json-3-1';
import { mediaTypes as openAPI30MediaTypes } from '@speclynx/apidom-parser-adapter-openapi-json-3-0';
import {
  AnnotationElement,
  includesClasses,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';
import { toJSON } from '@speclynx/apidom-core';
import { assert, expect } from 'chai';

import convert from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('converter', function () {
  context('strategies', function () {
    context('openapi-3-1-to-openapi-3-0-3', function () {
      context('security-requirements-empty-roles', function () {
        specify(
          'should set SecurityRequirement object to an empty array if it has SecurityScheme object type other than "oauth2" and "openIdConnect"',
          async function () {
            const fixturePath = path.join(
              __dirname,
              'fixtures',
              'security-requirements-empty-roles.json',
            );
            const convertedParseResult = await convert(fixturePath, {
              convert: {
                sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
                targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
              },
            });

            expect(toJSON(convertedParseResult.api!, undefined, 2)).toMatchSnapshot();
          },
        );

        specify('should create WARNING annotation', async function () {
          const fixturePath = path.join(
            __dirname,
            'fixtures',
            'security-requirements-empty-roles.json',
          );
          const convertedParseResult = await convert(fixturePath, {
            convert: {
              sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
              targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
            },
          });
          const annotations = Array.from(convertedParseResult.annotations) as AnnotationElement[];
          const annotation = annotations.find((a) =>
            a.code?.equals('security-requirements-empty-roles'),
          );

          assert.isDefined(annotation);
          assert.lengthOf(annotations, 1);
          assert.isTrue(includesClasses(annotation!, ['warning']));
        });

        specify('should attach source map to annotation', async function () {
          const fixturePath = path.join(
            __dirname,
            'fixtures',
            'security-requirements-empty-roles.json',
          );
          const convertedParseResult = await convert(fixturePath, {
            parse: {
              parserOpts: { sourceMap: true, strict: false },
            },
            convert: {
              sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
              targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
            },
          });
          const annotations = Array.from(convertedParseResult.annotations) as AnnotationElement[];
          const annotation = annotations.find((a) =>
            a.code?.equals('security-requirements-empty-roles'),
          )!;

          assert.isTrue(hasElementSourceMap(annotation));

          assert.strictEqual(annotation.startLine, 15);
          assert.strictEqual(annotation.startCharacter, 29);
          assert.strictEqual(annotation.startOffset, 299);

          assert.strictEqual(annotation.endLine, 18);
          assert.strictEqual(annotation.endCharacter, 13);
          assert.strictEqual(annotation.endOffset, 358);
        });
      });
    });
  });
});
