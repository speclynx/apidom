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
      context('security-scheme-type', function () {
        specify(
          'should remove SecurityScheme object if it has "mutualTLS" type',
          async function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'security-scheme-type.json');
            const convertedParseResult = await convert(fixturePath, {
              convert: {
                sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
                targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
              },
            });

            expect(toJSON(convertedParseResult.api!, undefined, 2)).toMatchSnapshot();
          },
        );

        specify('should create ERROR annotation', async function () {
          const fixturePath = path.join(__dirname, 'fixtures', 'security-scheme-type.json');
          const convertedParseResult = await convert(fixturePath, {
            convert: {
              sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
              targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
            },
          });
          const annotations = Array.from(convertedParseResult.annotations) as AnnotationElement[];
          const annotation = annotations.find((a) => a.code?.equals('mutualTLS'));

          assert.isDefined(annotation);
          assert.lengthOf(annotations, 2);
          assert.isTrue(includesClasses(annotation!, ['error']));
        });

        specify('should attach source map to annotation', async function () {
          const fixturePath = path.join(__dirname, 'fixtures', 'security-scheme-type.json');
          const convertedParseResult = await convert(fixturePath, {
            parse: {
              parserOpts: { sourceMap: true },
            },
            convert: {
              sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
              targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
            },
          });
          const annotations = Array.from(convertedParseResult.annotations) as AnnotationElement[];
          const annotation = annotations.find((a) => a.code?.equals('mutualTLS'))!;

          assert.isTrue(hasElementSourceMap(annotation));

          assert.strictEqual(annotation.startLine, 9);
          assert.strictEqual(annotation.startCharacter, 32);
          assert.strictEqual(annotation.startOffset, 188);

          assert.strictEqual(annotation.endLine, 12);
          assert.strictEqual(annotation.endCharacter, 13);
          assert.strictEqual(annotation.endOffset, 247);
        });

        specify(
          'should remove Reference Objects pointing to removable Security Scheme Objects',
          async function () {
            const fixturePath = path.join(__dirname, 'fixtures', 'reference-objects.json');
            const convertedParseResult = await convert(fixturePath, {
              convert: {
                sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
                targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
              },
            });

            expect(toJSON(convertedParseResult.api!, undefined, 2)).toMatchSnapshot();
          },
        );
      });
    });
  });
});
