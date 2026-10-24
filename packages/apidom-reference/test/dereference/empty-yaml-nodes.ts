import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { Element, ObjectElement, ParseResultElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { parse as parseOpenAPI2 } from '@speclynx/apidom-parser-adapter-openapi-yaml-2';
import { parse as parseOpenAPI3_0 } from '@speclynx/apidom-parser-adapter-openapi-yaml-3-0';
import { parse as parseOpenAPI3_1 } from '@speclynx/apidom-parser-adapter-openapi-yaml-3-1';
import { parse as parseAsyncAPI2 } from '@speclynx/apidom-parser-adapter-asyncapi-yaml-2';
import { parse as parseArazzo1 } from '@speclynx/apidom-parser-adapter-arazzo-yaml-1';

import { dereferenceApiDOM } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// the documents are parsed in memory; an empty URI field references nothing to read
const baseURI = path.join(__dirname, 'empty-yaml-nodes.yaml');

type Parse = (source: string) => Promise<ParseResultElement>;

const getIn = (element: Element, keys: string[]): Element =>
  keys.reduce((current, key) => (current as ObjectElement).get(key) as Element, element);

// https://github.com/speclynx/apidom/issues/696
describe('dereferenceApiDOM', function () {
  context('given empty YAML values in URI fields', function () {
    const cases: [string, Parse, string, string[], string][] = [
      [
        'OpenAPI 2.0 Reference Object',
        parseOpenAPI2,
        "swagger: '2.0'\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
        '$ref',
      ],
      [
        'OpenAPI 2.0 Path Item Object',
        parseOpenAPI2,
        "swagger: '2.0'\npaths:\n  /a:\n    $ref:\n",
        ['paths', '/a'],
        '$ref',
      ],
      [
        'OpenAPI 2.0 JSON Reference',
        parseOpenAPI2,
        "swagger: '2.0'\ndefinitions:\n  Pet:\n    $ref:\n",
        ['definitions', 'Pet'],
        '$ref',
      ],
      [
        'OpenAPI 3.0 Reference Object',
        parseOpenAPI3_0,
        "openapi: 3.0.4\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
        '$ref',
      ],
      [
        'OpenAPI 3.0 Path Item Object',
        parseOpenAPI3_0,
        'openapi: 3.0.4\npaths:\n  /a:\n    $ref:\n',
        ['paths', '/a'],
        '$ref',
      ],
      [
        'OpenAPI 3.0 Link Object',
        parseOpenAPI3_0,
        'openapi: 3.0.4\ncomponents:\n  links:\n    Link:\n      operationRef:\n',
        ['components', 'links', 'Link'],
        'operationRef',
      ],
      [
        'OpenAPI 3.0 Example Object',
        parseOpenAPI3_0,
        'openapi: 3.0.4\ncomponents:\n  examples:\n    Example:\n      externalValue:\n',
        ['components', 'examples', 'Example'],
        'externalValue',
      ],
      [
        'OpenAPI 3.1 Reference Object',
        parseOpenAPI3_1,
        "openapi: 3.1.0\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
        '$ref',
      ],
      [
        'OpenAPI 3.1 Path Item Object',
        parseOpenAPI3_1,
        'openapi: 3.1.0\npaths:\n  /a:\n    $ref:\n',
        ['paths', '/a'],
        '$ref',
      ],
      [
        'OpenAPI 3.1 Schema Object',
        parseOpenAPI3_1,
        'openapi: 3.1.0\ncomponents:\n  schemas:\n    Pet:\n      $ref:\n',
        ['components', 'schemas', 'Pet'],
        '$ref',
      ],
      [
        'AsyncAPI 2 Reference Object',
        parseAsyncAPI2,
        'asyncapi: 2.6.0\nchannels:\n  a:\n    subscribe:\n      message:\n        $ref:\n',
        ['channels', 'a', 'subscribe', 'message'],
        '$ref',
      ],
      [
        'AsyncAPI 2 Channel Item Object',
        parseAsyncAPI2,
        'asyncapi: 2.6.0\nchannels:\n  a:\n    $ref:\n',
        ['channels', 'a'],
        '$ref',
      ],
      [
        'Arazzo 1 JSON Schema',
        parseArazzo1,
        'arazzo: 1.0.1\ncomponents:\n  inputs:\n    Input:\n      $ref:\n',
        ['components', 'inputs', 'Input'],
        '$ref',
      ],
    ];

    cases.forEach(([objectName, parse, yaml, keys, field]) => {
      specify(`should leave ${objectName} with empty ${field} as is`, async function () {
        const dereferenced = await dereferenceApiDOM(await parse(yaml), { resolve: { baseURI } });

        assert.deepEqual(toValue(getIn(dereferenced.api!, keys)), { [field]: null });
      });
    });
  });
});
