import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, assert } from 'chai';
import { mediaTypes as openAPI31MediaTypes } from '@speclynx/apidom-parser-adapter-openapi-json-3-1';
import { mediaTypes as openAPI30MediaTypes } from '@speclynx/apidom-parser-adapter-openapi-json-3-0';
import { AnnotationElement, ParseResultElement, includesClasses } from '@speclynx/apidom-datamodel';
import { toJSON } from '@speclynx/apidom-core';

import convert from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('converter', function () {
  context('strategies', function () {
    context('openapi-3-1-to-openapi-3-0-3', function () {
      context('info-summary', function () {
        const fixturePath = path.join(__dirname, 'fixtures', 'info-summary.json');
        let convertedParseResult: ParseResultElement;

        beforeEach(async function () {
          convertedParseResult = await convert(fixturePath, {
            convert: {
              sourceMediaType: openAPI31MediaTypes.findBy('3.1.0', 'json'),
              targetMediaType: openAPI30MediaTypes.findBy('3.0.3', 'json'),
            },
          });
        });

        specify('should remove Info.summary field', async function () {
          expect(toJSON(convertedParseResult.api!, undefined, 2)).toMatchSnapshot();
        });

        specify('should create WARNING annotation', async function () {
          const annotations = Array.from(convertedParseResult.annotations) as AnnotationElement[];
          const annotation = annotations.find((a) => a.code?.equals('info-summary'));

          assert.isDefined(annotation);
          assert.isTrue(includesClasses(annotation!, ['warning']));
        });
      });
    });
  });
});
