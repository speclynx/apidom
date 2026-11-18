import path from 'node:path';
import { assert } from 'chai';
import { Element } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { mediaTypes as openApi2MediaTypes } from '@speclynx/apidom-ns-openapi-2';
import { mediaTypes as openApi30MediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { mediaTypes as openApi31MediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { mediaTypes as asyncApi2MediaTypes } from '@speclynx/apidom-ns-asyncapi-2';
import { mediaTypes as arazzo1MediaTypes } from '@speclynx/apidom-ns-arazzo-1';
import { mediaTypes as overlay1MediaTypes } from '@speclynx/apidom-ns-overlay-1';
import { fileURLToPath } from 'node:url';

import { dereference, dereferenceApiDOM, parse } from '../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// fixture (object/name), JSON Pointer to the annotated element, file and pointer it's defined at
type Case = [fixture: string, location: string, originFile: string, originPointer?: string];

const chains = {
  pathItem: ['path-item-object/external-indirections', '/paths/~1path1', 'ex2.json', '/~1path3'],
  parameter: [
    'reference-object/external-indirections',
    '/components/parameters/externalRef',
    'ex3.json',
    '/externalParameter',
  ],
} satisfies Record<string, Case>;
const externalValue: Case = [
  'example-object/external-value-json',
  '/components/examples/example1/value',
  'ex.json',
  '',
];
const operationRef: Case = [
  'link-object/operation-ref-external',
  '/components/links/link1/operationRef',
  'ex.json',
  '/operation',
];

const strategies: Record<string, { mediaType: string; root: string; cases: Case[] }> = {
  'openapi-3-1': {
    mediaType: openApi31MediaTypes.latest('json'),
    root: 'root.json',
    cases: [
      ['path-item-object/external-only', '/paths/~1path1', 'ex.json', '/~1path2'],
      chains.pathItem,
      chains.parameter,
      ['schema-object/external-indirections', '/components/schemas/Indirection', 'ex3.json', ''],
      [
        'schema-object/boolean-json-schema',
        '/components/schemas/User/properties/profile',
        'root.json',
        '/components/schemas/UserProfile',
      ],
      [
        'schema-object/cycle-internal',
        '/components/schemas/User/properties/parent',
        'root.json',
        '/components/schemas/User',
      ],
      // a reference that never reaches a value has no content to point at
      ['schema-object/indirect-internal-circular', '/components/schemas/User', 'root.json'],
      // not resolved by JSON Pointer
      ['schema-object/$anchor-external', '/components/schemas/User/properties/profile', 'ex.json'],
      // resolved against an `$id` base by retrieving the URL
      [
        'schema-object/$id-uri-enclosing',
        '/components/schemas/User/properties/profile',
        'nested/ex.json',
        '',
      ],
      externalValue,
      operationRef,
      [
        'link-object/operation-id',
        '/components/links/link1/operationId',
        'root.json',
        '/components/pathItems/pathItem1/get',
      ],
    ],
  },
  'openapi-3-0': {
    mediaType: openApi30MediaTypes.latest('json'),
    root: 'entry.json',
    cases: [
      chains.pathItem,
      chains.parameter,
      externalValue,
      operationRef,
      [
        'link-object/operation-id',
        '/components/links/link1/operationId',
        'entry.json',
        '/paths/~1path/get',
      ],
    ],
  },
  'openapi-2': {
    mediaType: openApi2MediaTypes.latest('json'),
    root: 'entry.json',
    cases: [
      chains.pathItem,
      [chains.parameter[0], '/paths/~1/parameters/0', 'ex3.json', '/externalParameter'],
      [
        'json-reference-object/external-indirections',
        '/definitions/schema',
        'ex3.json',
        '/definitions/externalSchema',
      ],
    ],
  },
  'asyncapi-2': {
    mediaType: asyncApi2MediaTypes.latest('json'),
    root: 'root.json',
    cases: [
      chains.parameter,
      [
        'channel-item-object/external-indirections',
        '/channels/channelItem1',
        'ex2.json',
        '/channelItem3',
      ],
      [
        'schema-object/components-schemas',
        '/components/schemas/schema2',
        'root.json',
        '/components/schemas/schema1',
      ],
    ],
  },
  'arazzo-1': {
    mediaType: arazzo1MediaTypes.latest('json'),
    root: 'root.json',
    cases: [
      [
        'json-schema-object/external-indirections',
        '/components/inputs/Indirection',
        'ex3.json',
        '',
      ],
      [
        'json-schema-object/boolean-json-schema',
        '/components/inputs/User/properties/additionalInfo',
        'root.json',
        '/components/inputs/AlwaysValid',
      ],
      [
        'reusable-object/step-parameters',
        '/workflows/0/steps/0/parameters/0',
        'root.json',
        '/components/parameters/petId',
      ],
    ],
  },
  'overlay-1': {
    mediaType: overlay1MediaTypes.latest('json'),
    root: 'overlay.json',
    cases: [
      ['reusable-actions/.', '/actions/1', 'overlay.json', '/components/actions/errorResponse'],
    ],
  },
};

const fixturePath = (strategy: string, fixture: string, file: string) => {
  const [object, name] = fixture.split('/');
  return path.join(__dirname, strategy, object, 'fixtures', name, file);
};

describe('dereference', function () {
  context('strategies', function () {
    context('origin of transcluded elements', function () {
      Object.entries(strategies).forEach(([strategy, { mediaType, root, cases }]) => {
        cases.forEach(([fixture, location, originFile, originPointer]) => {
          specify(`should annotate ${strategy} ${fixture} at ${location}`, async function () {
            const dereferenced = await dereference(fixturePath(strategy, fixture, root), {
              parse: { mediaType },
            });
            const located = evaluate<Element>(dereferenced, `/0${location}`);
            // an Operation Object is attached to the field of the Link Object referencing it
            const element = located.meta.hasKey('operation')
              ? (located.meta.get('operation') as Element)
              : located;

            assert.strictEqual(
              toValue(element.meta.get('ref-origin')),
              fixturePath(strategy, fixture, originFile),
            );
            assert.strictEqual(toValue(element.meta.get('ref-origin-pointer')), originPointer);
          });
        });
      });

      [true, false].forEach((immutable) => {
        specify(
          `should annotate a chain when dereferencing ApiDOM twice, immutable: ${immutable}`,
          async function () {
            const { mediaType } = strategies['openapi-3-1'];
            const [fixture, location, originFile, originPointer] = chains.pathItem;
            const rootFilePath = fixturePath('openapi-3-1', fixture, 'root.json');
            const parseResult = await parse(rootFilePath, { parse: { mediaType } });
            const options = {
              parse: { mediaType },
              resolve: { baseURI: rootFilePath },
              dereference: { immutable },
            };
            const dereferenced = await dereferenceApiDOM(
              await dereferenceApiDOM(parseResult, options),
              options,
            );
            const transcluded = evaluate<Element>(dereferenced, `/0${location}`);

            assert.strictEqual(
              toValue(transcluded.meta.get('ref-origin')),
              fixturePath('openapi-3-1', fixture, originFile),
            );
            assert.strictEqual(toValue(transcluded.meta.get('ref-origin-pointer')), originPointer);
            // only dereferencing in place annotates the given ApiDOM
            assert.strictEqual(
              evaluate<Element>(parseResult, `/0${location}`).meta.hasKey('ref-origin'),
              !immutable,
            );
          },
        );
      });

      specify(
        'should not annotate a circular reference replaced by Ref Element',
        async function () {
          const { mediaType } = strategies['openapi-3-1'];
          const dereferenced = await dereference(
            fixturePath('openapi-3-1', 'schema-object/cycle-internal', 'root.json'),
            { parse: { mediaType }, dereference: { circular: 'replace' } },
          );
          const ref = evaluate<Element>(
            dereferenced,
            '/0/components/schemas/User/properties/parent',
          );

          assert.strictEqual(ref.element, 'ref');
          assert.isFalse(ref.meta.hasKey('ref-origin'));
          assert.isFalse(ref.meta.hasKey('ref-origin-pointer'));
        },
      );

      specify('should not annotate a reference left as it is', async function () {
        const { mediaType } = strategies['openapi-3-1'];
        const dereferenced = await dereference(
          fixturePath('openapi-3-1', 'reference-object/indirect-internal-circular', 'root.json'),
          { parse: { mediaType }, dereference: { circular: 'error', continueOnError: true } },
        );
        const reference = evaluate<Element>(dereferenced, '/0/components/parameters/indirection1');

        assert.isFalse(reference.meta.hasKey('ref-origin'));
        assert.isFalse(reference.meta.hasKey('ref-origin-pointer'));
      });

      specify(
        'should annotate with the document URI given base URI with fragment',
        async function () {
          const { mediaType } = strategies['overlay-1'];
          const rootFilePath = fixturePath('overlay-1', 'reusable-actions/.', 'overlay.json');
          const parseResult = await parse(rootFilePath, { parse: { mediaType } });
          const dereferenced = await dereferenceApiDOM(parseResult, {
            parse: { mediaType },
            resolve: { baseURI: `${rootFilePath}#/actions` },
          });

          assert.strictEqual(
            toValue(evaluate<Element>(dereferenced, '/0/actions/1').meta.get('ref-origin')),
            rootFilePath,
          );
        },
      );
    });
  });
});
