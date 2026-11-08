import { assert } from 'chai';
import { ParseResultElement, cloneDeep, type Element } from '@speclynx/apidom-datamodel';
import { parse } from '@speclynx/apidom-parser-adapter-openapi-json-3-1';
import { parse as parseOpenAPI3_0 } from '@speclynx/apidom-parser-adapter-openapi-json-3-0';
import { toValue } from '@speclynx/apidom-core';
import { evaluate } from '@speclynx/apidom-json-pointer';
import { mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';
import { mediaTypes as openAPI3_0MediaTypes } from '@speclynx/apidom-ns-openapi-3-0';

import { dereferenceApiDOM, Reference, ReferenceSet } from '../../src/index.ts';

const baseURI = 'https://example.com/';
const schemas = { A: { type: 'string' }, B: { $ref: '#/components/schemas/A' } };

const toParseResult = (components: object): Promise<ParseResultElement> =>
  parse(JSON.stringify({ openapi: '3.1.0', info: { title: 't', version: '1' }, components }));

const toFrozenParseResult = async (components: object): Promise<ParseResultElement> => {
  const parseResult = await toParseResult(components);
  parseResult.freeze();
  return parseResult;
};

const dereferenceInPlace = async (element: Element, options: object = {}) =>
  (await dereferenceApiDOM(element, {
    parse: { mediaType: mediaTypes.latest('json') },
    resolve: { baseURI },
    dereference: { immutable: false },
    ...options,
  })) as unknown as ParseResultElement;

const valueAt = (element: Element | undefined, pointer: string) =>
  toValue(evaluate(element as Element, pointer));

describe('dereference', function () {
  context('given frozen elements and immutable=false', function () {
    specify('should dereference a frozen document without editing it', async function () {
      const parseResult = await toFrozenParseResult({ schemas });

      const dereferenced = await dereferenceInPlace(parseResult);

      assert.deepEqual(valueAt(dereferenced.api, '/components/schemas/B'), { type: 'string' });
      assert.deepEqual(valueAt(parseResult.api, '/components/schemas/B'), {
        $ref: '#/components/schemas/A',
      });
    });

    specify(
      'should dereference a document with frozen parsed result without editing it',
      async function () {
        const parseResult = await toParseResult({ schemas });
        (parseResult.api as Element).freeze();

        const dereferenced = await dereferenceInPlace(parseResult);

        assert.deepEqual(valueAt(dereferenced.api, '/components/schemas/B'), { type: 'string' });
        assert.deepEqual(valueAt(parseResult.api, '/components/schemas/B'), {
          $ref: '#/components/schemas/A',
        });
      },
    );

    specify('should keep cycles leading back to the frozen root', async function () {
      const parseResult = await toFrozenParseResult({
        schemas: { A: { properties: { self: { $ref: '#/components/schemas/A' } } } },
      });

      const dereferenced = await dereferenceInPlace(parseResult);
      const schemaA = evaluate<Element>(dereferenced.api as Element, '/components/schemas/A');

      // the transcluded Schema Object is a shallow copy of A, sharing its fields
      assert.strictEqual(
        evaluate(schemaA, '/properties/self/properties'),
        evaluate(schemaA, '/properties'),
      );
      assert.deepEqual(valueAt(parseResult.api, '/components/schemas/A/properties/self'), {
        $ref: '#/components/schemas/A',
      });
    });

    specify('should dereference a frozen referencing element in a ReferenceSet', async function () {
      const parseResult = await toFrozenParseResult({ schemas });
      const referencingElement = evaluate<Element>(
        parseResult.api as Element,
        '/components/schemas/B',
      );
      const refSet = new ReferenceSet({
        refs: [
          new Reference({ uri: `${baseURI}#reference`, value: referencingElement }),
          new Reference({ uri: baseURI, value: cloneDeep(parseResult) }),
        ],
      });

      // fails if any in-place edit is attempted on the frozen referencing element;
      // the result of dereferencing a lone element of a ReferenceSet is covered by #706
      await dereferenceInPlace(referencingElement, {
        resolve: { baseURI: `${baseURI}#reference`, external: false },
        dereference: { refSet, immutable: false },
      });

      assert.isTrue(referencingElement.isFrozen);
      assert.deepEqual(toValue(referencingElement), { $ref: '#/components/schemas/A' });
    });

    specify(
      'should copy an unfrozen document given a frozen document in the ReferenceSet',
      async function () {
        const parseResult = await toParseResult({ schemas });
        const frozenParseResult = await toFrozenParseResult({ schemas });
        const refSet = new ReferenceSet({
          refs: [
            new Reference({ uri: baseURI, value: parseResult }),
            new Reference({ uri: `${baseURI}other.json`, value: frozenParseResult }),
          ],
        });

        const dereferenced = await dereferenceInPlace(parseResult, {
          dereference: { refSet, immutable: false },
        });

        assert.notStrictEqual(dereferenced, parseResult);
        assert.deepEqual(valueAt(dereferenced.api, '/components/schemas/B'), { type: 'string' });
        assert.deepEqual(valueAt(parseResult.api, '/components/schemas/B'), {
          $ref: '#/components/schemas/A',
        });
      },
    );

    specify(
      'should dereference a frozen OpenAPI 3.0 document without editing it',
      async function () {
        const parseResult = await parseOpenAPI3_0(
          JSON.stringify({
            openapi: '3.0.4',
            info: { title: 't', version: '1' },
            components: { schemas },
          }),
        );
        parseResult.freeze();

        const dereferenced = await dereferenceInPlace(parseResult, {
          parse: { mediaType: openAPI3_0MediaTypes.latest('json') },
        });

        assert.deepEqual(valueAt(dereferenced.api, '/components/schemas/B'), { type: 'string' });
        assert.deepEqual(valueAt(parseResult.api, '/components/schemas/B'), {
          $ref: '#/components/schemas/A',
        });
      },
    );
  });
});
