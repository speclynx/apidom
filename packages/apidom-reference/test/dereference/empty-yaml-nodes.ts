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
import type { LinkElement } from '@speclynx/apidom-ns-openapi-3-0';

import { dereferenceApiDOM, UnresolvableReferenceError } from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// the documents are parsed in memory; every reference in them is a same-document one
const baseURI = path.join(__dirname, 'empty-yaml-nodes.yaml');

type Parse = (source: string) => Promise<ParseResultElement>;

const getIn = (element: Element, keys: string[]): Element =>
  keys.reduce((current, key) => (current as ObjectElement).get(key) as Element, element);

// a same-document reference resolves to (a copy of) the document, which has the root's fields
const keysOf = (element: Element): string[] => (element as ObjectElement).keys() as string[];

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
        const referencedElement = getIn(dereferenced.api!, location);

        assert.isFalse((referencedElement as ObjectElement).hasKey('$ref'));
        assert.sameMembers(keysOf(referencedElement), keysOf(dereferenced.api!));
      });
    });

    [
      ['OpenAPI 3.0', parseOpenAPI3_0, 'openapi: 3.0.4'],
      ['OpenAPI 3.1', parseOpenAPI3_1, 'openapi: 3.1.0'],
    ].forEach(([specName, parse, versionLine]) => {
      specify(
        `should dereference empty externalValue of ${specName} Example Object to the document`,
        async function () {
          const dereferenced = await dereferenceYAML(
            parse as Parse,
            `${versionLine}\ncomponents:\n  examples:\n    e:\n      externalValue:\n`,
          );
          const valueElement = getIn(dereferenced.api!, ['components', 'examples', 'e', 'value']);

          assert.sameMembers(keysOf(valueElement), keysOf(dereferenced.api!));
        },
      );

      specify(
        `should dereference empty operationRef of ${specName} Link Object to the document`,
        async function () {
          const dereferenced = await dereferenceYAML(
            parse as Parse,
            `${versionLine}\ncomponents:\n  links:\n    l:\n      operationRef:\n`,
          );
          const linkElement = getIn(dereferenced.api!, ['components', 'links', 'l']) as LinkElement;

          assert.sameMembers(keysOf(linkElement.operation!), keysOf(dereferenced.api!));
        },
      );
    });

    [
      ['OpenAPI 3.1 Schema Object', parseOpenAPI3_1, 'openapi: 3.1.0', 'schemas'],
      ['Arazzo 1 JSON Schema', parseArazzo1, 'arazzo: 1.0.1', 'inputs'],
    ].forEach(([objectName, parse, versionLine, componentsField]) => {
      specify(`should dereference empty $ref of ${objectName} to the document`, async function () {
        // "" resolves to the document only when a resolver can read the base URI, as the file
        // resolver can in this suite; otherwise it fails to evaluate (#554)
        const dereferenced = await dereferenceYAML(
          parse as Parse,
          `${versionLine}\ncomponents:\n  ${componentsField}:\n    Pet:\n      $ref:\n`,
        );
        const schemaElement = getIn(dereferenced.api!, [
          'components',
          componentsField as string,
          'Pet',
        ]);

        assert.sameMembers(keysOf(schemaElement), keysOf(dereferenced.api!));
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

    context('given Overlay extends', function () {
      const options = { dereference: { strategyOpts: { 'overlay-1': { extends: true } } } };
      const overlayYAML = (extendsLine: string) =>
        `overlay: 1.1.0\n${extendsLine}\nactions:\n  - target: $.info\n    remove: true\n`;
      const extendsResultsOf = (parseResult: ParseResultElement) =>
        [...parseResult].filter((element) => element.classes.includes('extends'));

      specify('should treat empty extends as no extends target', async function () {
        const parse: Parse = (source) => parseOverlay1(source, { strict: false });
        const dereferenced = await dereferenceYAML(parse, overlayYAML('extends:'), options);

        assert.lengthOf(extendsResultsOf(dereferenced), 0);
      });

      specify('should treat null extends of strict parser as no extends target', async function () {
        const parse: Parse = (source) => parseOverlay1(source, { strict: true });
        const dereferenced = await dereferenceYAML(parse, overlayYAML('extends:'), options);

        assert.lengthOf(extendsResultsOf(dereferenced), 0);
      });

      specify('should resolve extends "" as same-document reference', async function () {
        // it names the Overlay itself (#695); the base file doesn't exist here, so loading it
        // ends with an error annotation instead of recursing
        const dereferenced = await dereferenceYAML(
          parseOverlay1,
          overlayYAML('extends: ""'),
          options,
        );
        const [extendsResult] = extendsResultsOf(dereferenced);

        assert.strictEqual(extendsResult?.meta.get('retrievalURI'), baseURI);
      });
    });
  });
});
