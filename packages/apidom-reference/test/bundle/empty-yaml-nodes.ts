import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { Element } from '@speclynx/apidom-datamodel';
import { evaluate } from '@speclynx/apidom-json-pointer';

import { bundle } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'empty-yaml-nodes');

// the strict YAML parser reads an empty node as null; the tree-sitter one keeps it as empty string
const bundleYAML = (fileName: string) =>
  bundle(path.join(fixturePath, fileName), { parse: { parserOpts: { strict: false } } });

describe('bundle', function () {
  context('given empty YAML nodes in URI fields', function () {
    // a same-document reference is written as "#"; Arazzo JSON Schema $ref is kept as written
    const pathsReferences = { '/paths/~1a/get/responses/200': '#', '/paths/~1b': '#' };
    const channelsReferences = { '/channels/a/subscribe/message': '#', '/channels/b': '#' };
    const expectations: [string, string, Record<string, string>][] = [
      ['OpenAPI 2.0', 'openapi-2.yaml', pathsReferences],
      ['OpenAPI 3.0', 'openapi-3-0.yaml', pathsReferences],
      ['OpenAPI 3.1', 'openapi-3-1.yaml', pathsReferences],
      ['AsyncAPI 2', 'asyncapi-2.yaml', channelsReferences],
      ['Arazzo 1', 'arazzo-1.yaml', { '/components/inputs/Input': '' }],
    ];

    expectations.forEach(([specName, fileName, expectedReferences]) => {
      specify(`should bundle ${specName} document`, async function () {
        const bundled = await bundleYAML(fileName);

        Object.entries(expectedReferences).forEach(([jsonPointer, expectedReference]) => {
          const referenceElement = evaluate<Element>(
            bundled.result as Element,
            `${jsonPointer}/$ref`,
          );
          assert.strictEqual(referenceElement.toValue(), expectedReference);
        });
      });
    });
  });
});
