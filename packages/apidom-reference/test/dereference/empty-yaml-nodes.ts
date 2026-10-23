import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import { Element, ObjectElement, ParseResultElement } from '@speclynx/apidom-datamodel';
import { parse as parseOpenAPI2 } from '@speclynx/apidom-parser-adapter-openapi-yaml-2';
import { parse as parseOpenAPI3_0 } from '@speclynx/apidom-parser-adapter-openapi-yaml-3-0';
import { parse as parseOpenAPI3_1 } from '@speclynx/apidom-parser-adapter-openapi-yaml-3-1';
import { parse as parseAsyncAPI2 } from '@speclynx/apidom-parser-adapter-asyncapi-yaml-2';
import { parse as parseArazzo1 } from '@speclynx/apidom-parser-adapter-arazzo-yaml-1';
import { parse as parseOverlay1 } from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

import { dereferenceApiDOM, UnresolvableReferenceError } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// the documents are parsed in memory; every reference in them is a same-document one
const baseURI = path.join(__dirname, 'empty-yaml-nodes.yaml');

type Parse = (source: string) => Promise<ParseResultElement>;

const getIn = (element: Element, keys: string[]): Element =>
  keys.reduce((current, key) => (current as ObjectElement).get(key) as Element, element);

const dereferenceYAML = async (parse: Parse, yaml: string, options = {}) =>
  dereferenceApiDOM(await parse(yaml), { resolve: { baseURI }, ...options });

describe('dereferenceApiDOM', function () {
  context('given empty YAML nodes in URI fields', function () {
    const sameDocumentReferences: [string, Parse, string, string[]][] = [
      [
        'OpenAPI 2.0 Reference Object',
        parseOpenAPI2,
        "swagger: '2.0'\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
      ],
      [
        'OpenAPI 2.0 Path Item Object',
        parseOpenAPI2,
        "swagger: '2.0'\npaths:\n  /a:\n    $ref:\n",
        ['paths', '/a'],
      ],
      [
        'OpenAPI 2.0 JSON Reference',
        parseOpenAPI2,
        "swagger: '2.0'\ndefinitions:\n  Pet:\n    $ref:\n",
        ['definitions', 'Pet'],
      ],
      [
        'OpenAPI 3.0 Reference Object',
        parseOpenAPI3_0,
        "openapi: 3.0.4\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
      ],
      [
        'OpenAPI 3.0 Path Item Object',
        parseOpenAPI3_0,
        'openapi: 3.0.4\npaths:\n  /a:\n    $ref:\n',
        ['paths', '/a'],
      ],
      [
        'OpenAPI 3.1 Reference Object',
        parseOpenAPI3_1,
        "openapi: 3.1.0\npaths:\n  /a:\n    get:\n      responses:\n        '200':\n          $ref:\n",
        ['paths', '/a', 'get', 'responses', '200'],
      ],
      [
        'OpenAPI 3.1 Path Item Object',
        parseOpenAPI3_1,
        'openapi: 3.1.0\npaths:\n  /a:\n    $ref:\n',
        ['paths', '/a'],
      ],
      [
        'AsyncAPI 2 Reference Object',
        parseAsyncAPI2,
        'asyncapi: 2.6.0\nchannels:\n  a:\n    subscribe:\n      message:\n        $ref:\n',
        ['channels', 'a', 'subscribe', 'message'],
      ],
      [
        'AsyncAPI 2 Channel Item Object',
        parseAsyncAPI2,
        'asyncapi: 2.6.0\nchannels:\n  a:\n    $ref:\n',
        ['channels', 'a'],
      ],
    ];

    sameDocumentReferences.forEach(([objectName, parse, yaml, location]) => {
      specify(`should dereference empty $ref of ${objectName} to the document`, async function () {
        const dereferenced = await dereferenceYAML(parse, yaml);

        assert.isFalse((getIn(dereferenced.api!, location) as ObjectElement).hasKey('$ref'));
      });
    });

    [
      ['OpenAPI 3.0', parseOpenAPI3_0, 'openapi: 3.0.4'],
      ['OpenAPI 3.1', parseOpenAPI3_1, 'openapi: 3.1.0'],
    ].forEach(([specName, parse, versionLine]) => {
      specify(
        `should dereference empty externalValue of ${specName} Example Object`,
        async function () {
          const dereferenced = await dereferenceYAML(
            parse as Parse,
            `${versionLine}\ncomponents:\n  examples:\n    e:\n      externalValue:\n`,
          );
          const exampleElement = getIn(dereferenced.api!, ['components', 'examples', 'e']);

          assert.isTrue((exampleElement as ObjectElement).hasKey('value'));
        },
      );

      specify(
        `should dereference empty operationRef of ${specName} Link Object`,
        async function () {
          const dereferenced = await dereferenceYAML(
            parse as Parse,
            `${versionLine}\ncomponents:\n  links:\n    l:\n      operationRef:\n`,
          );

          assert.strictEqual(
            getIn(dereferenced.api!, ['components', 'links', 'l']).element,
            'link',
          );
        },
      );
    });

    [
      ['OpenAPI 3.1 Schema Object', parseOpenAPI3_1, 'openapi: 3.1.0\ncomponents:\n  schemas:\n'],
      ['Arazzo 1 JSON Schema', parseArazzo1, 'arazzo: 1.0.1\ncomponents:\n  inputs:\n'],
    ].forEach(([objectName, parse, prefix]) => {
      specify(`should not fail on empty $ref of ${objectName} with TypeError`, async function () {
        // whether "" resolves to the document or fails to evaluate depends on whether a resolver
        // can read the base URI (#554); either way, it must not fail on a null $ref
        try {
          await dereferenceYAML(parse as Parse, `${prefix}    Pet:\n      $ref:\n`);
        } catch (error) {
          assert.notInstanceOf((error as Error).cause, TypeError);
        }
      });
    });

    specify('should resolve $ref next to empty $id of Schema Object', async function () {
      const dereferenced = await dereferenceYAML(
        parseOpenAPI3_1,
        'openapi: 3.1.0\ncomponents:\n  schemas:\n    Pet:\n      $id:\n      properties:\n        a:\n          $ref: "#/$defs/x"\n      $defs:\n        x:\n          type: string\n',
      );
      const propertyElement = getIn(dereferenced.api!, [
        'components',
        'schemas',
        'Pet',
        'properties',
        'a',
      ]) as ObjectElement;

      assert.strictEqual(propertyElement.get('type')?.toValue(), 'string');
    });

    specify('should require Reusable Action Reference to be same-document', async function () {
      try {
        await dereferenceYAML(parseOverlay1, 'overlay: 1.2.0\nactions:\n  - $ref:\n');
        assert.fail('should throw UnresolvableReferenceError');
      } catch (error) {
        assert.instanceOf(error, UnresolvableReferenceError);
        assert.include(
          (error as Error).message,
          'Reusable Action Reference "" must be a same-document reference',
        );
      }
    });

    specify('should treat empty extends of Overlay as no extends target', async function () {
      const dereferenced = await dereferenceYAML(
        parseOverlay1,
        'overlay: 1.1.0\nextends:\nactions:\n  - target: $.info\n    remove: true\n',
        { dereference: { strategyOpts: { 'overlay-1': { extends: true } } } },
      );
      const extendsResults = [...dereferenced].filter((element) =>
        element.classes.includes('extends'),
      );

      assert.lengthOf(extendsResults, 0);
    });
  });
});
