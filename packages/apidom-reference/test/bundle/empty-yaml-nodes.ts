import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { Element } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'empty-yaml-nodes');

// https://github.com/speclynx/apidom/issues/696
describe('bundle', function () {
  context('given empty YAML values in URI fields', function () {
    const pathsReferences = ['/paths/~1a/get/responses/200', '/paths/~1b'];
    const expectations: [string, string, string[]][] = [
      ['OpenAPI 2.0', 'openapi-2.yaml', [...pathsReferences, '/definitions/Pet']],
      ['OpenAPI 3.0', 'openapi-3-0.yaml', pathsReferences],
      ['OpenAPI 3.1', 'openapi-3-1.yaml', [...pathsReferences, '/components/schemas/Pet']],
      ['AsyncAPI 2', 'asyncapi-2.yaml', ['/channels/a/subscribe/message', '/channels/b']],
      ['Arazzo 1', 'arazzo-1.yaml', ['/components/inputs/Input']],
    ];

    [false, true].forEach((strict) => {
      expectations.forEach(([specName, fileName, jsonPointers]) => {
        specify(
          `should leave empty $ref of ${specName} as is (strict: ${strict})`,
          async function () {
            const bundled = await bundle(path.join(fixturePath, fileName), {
              parse: { parserOpts: { strict } },
            });

            jsonPointers.forEach((jsonPointer) => {
              const element = evaluate<Element>(bundled.result as Element, jsonPointer);
              assert.deepEqual(toValue(element), { $ref: null }, jsonPointer);
            });
          },
        );
      });
    });
  });
});
