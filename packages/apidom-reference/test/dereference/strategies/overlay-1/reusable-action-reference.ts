import { assert } from 'chai';
import { toValue } from '@speclynx/apidom-core';

import {
  refractOverlay1,
  isActionElement,
  type Overlay1Element,
  type ReusableActionElement,
  type ActionElement,
  type ReusableActionReferenceElement,
  mediaTypes,
} from '@speclynx/apidom-ns-overlay-1';
import { ParseResultElement } from '@speclynx/apidom-datamodel';

import {
  dereferenceApiDOM,
  File,
  Reference,
  ReferenceSet,
  mergeOptions,
  options,
} from '../../../../src/index.ts';
import Overlay1DereferenceStrategy from '../../../../src/dereference/strategies/overlay-1/index.ts';
import UnresolvableReferenceError from '../../../../src/errors/UnresolvableReferenceError.ts';

const createOverlay = (
  reference: Record<string, unknown>,
  actions: Record<string, unknown> = {
    errorResponse: {
      description: 'Reusable error response',
      fields: {
        description: 'Adds an error response',
        update: { '404': { description: 'Not Found' } },
      },
    },
  },
) =>
  refractOverlay1<Overlay1Element>({
    overlay: '1.2.0',
    info: { title: 'Overlay', version: '1.0.0' },
    actions: [reference],
    components: { actions },
  });

// dereferences the reference element on its own, with a ReferenceSet holding it and the document
const resolveLone = async (
  overlay: Overlay1Element,
  { withDocument = true, immutable = true } = {},
) => {
  const referenceElement = overlay.actions!.get(0) as ReusableActionReferenceElement;
  const parseResult = new ParseResultElement([overlay]);
  parseResult.get(0)!.classes.push('result');
  const refSet = new ReferenceSet({
    refs: [
      new Reference({ uri: '/overlay.json#ref', value: referenceElement }),
      ...(withDocument ? [new Reference({ uri: '/overlay.json', value: parseResult })] : []),
    ],
  });

  return dereferenceApiDOM(referenceElement, {
    parse: { mediaType: mediaTypes.latest('json') },
    resolve: { baseURI: '/overlay.json#ref' },
    dereference: { refSet, immutable },
  });
};

const resolve = async (overlay: Overlay1Element) => {
  const dereferenced = await dereferenceApiDOM(overlay, { resolve: { baseURI: '/overlay.json' } });

  return dereferenced.actions!.get(0) as ActionElement;
};

describe('dereference Reusable Action Reference', function () {
  specify(
    'should resolve to an Action with reference target and reusable fields',
    async function () {
      const overlay = createOverlay({
        $ref: '#/components/actions/errorResponse',
        target: '$.paths.*.get.responses',
      });
      const actionElement = await resolve(overlay);

      assert.isTrue(isActionElement(actionElement));
      assert.deepEqual(toValue(actionElement), {
        target: '$.paths.*.get.responses',
        description: 'Adds an error response',
        update: { '404': { description: 'Not Found' } },
      });
    },
  );

  specify('should prefer the reference description', async function () {
    const overlay = createOverlay({
      $ref: '#/components/actions/errorResponse',
      target: '$',
      description: 'Overridden',
    });

    assert.strictEqual(toValue((await resolve(overlay)).description), 'Overridden');
  });

  specify('should not share elements with the overlay', async function () {
    const overlay = createOverlay({ $ref: '#/components/actions/errorResponse', target: '$' });
    const actionElement = await resolve(overlay);
    const reusableAction = overlay.components!.actions!.get(
      'errorResponse',
    ) as ReusableActionElement;

    assert.notStrictEqual(actionElement.update, reusableAction.fields!.update);
  });

  specify('should decode escaped component names', async function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/error-response~1v1~0beta', target: '$' },
      { 'error-response/v1~beta': { fields: { remove: true } } },
    );

    assert.isTrue(toValue((await resolve(overlay)).removeField));
  });

  specify('should percent-decode the fragment', async function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/error%20response', target: '$' },
      { 'error response': { fields: { remove: true } } },
    );

    assert.isTrue(toValue((await resolve(overlay)).removeField));
  });

  specify('should percent-decode the whole fragment', async function () {
    for (const $ref of [
      '#/comp%6Fnents/actions/errorResponse',
      '#%2Fcomponents%2Factions%2FerrorResponse',
    ]) {
      const overlay = createOverlay({ $ref, target: '$' });

      assert.isTrue(isActionElement(await resolve(overlay)));
    }
  });

  specify('should resolve reusable action without fields', async function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/empty', target: '$' },
      { empty: {} },
    );

    assert.deepEqual(toValue(await resolve(overlay)), { target: '$' });
  });

  context('given a lone Reusable Action Reference', function () {
    specify('should resolve it against the document in the ReferenceSet', async function () {
      const overlay = createOverlay({
        $ref: '#/components/actions/errorResponse',
        target: '$.paths.*.get.responses',
      });
      // dereferenceApiDOM doesn't return the replaced element for a pre-registered reference
      // (as for OpenAPI), so success means no UnresolvableReferenceError
      await resolveLone(overlay);
    });

    specify('should be replaced by the strategy with the resolved Action', async function () {
      const overlay = createOverlay({
        $ref: '#/components/actions/errorResponse',
        target: '$.paths.*.get.responses',
      });
      const referenceElement = overlay.actions!.get(0) as ReusableActionReferenceElement;
      const parseResult = new ParseResultElement([overlay]);
      parseResult.get(0)!.classes.push('result');
      // the document is registered first, so it is the refSet's root reference
      const refSet = new ReferenceSet({
        refs: [
          new Reference({ uri: '/overlay.json', value: parseResult }),
          new Reference({ uri: '/overlay.json#ref', value: referenceElement }),
        ],
      });
      const file = new File({
        uri: '/overlay.json#ref',
        parseResult: new ParseResultElement([referenceElement]),
        mediaType: mediaTypes.latest('json'),
      });
      const actionElement = await new Overlay1DereferenceStrategy().dereference(
        file,
        mergeOptions(options, { dereference: { refSet } }),
      );

      assert.isTrue(isActionElement(actionElement));
      assert.deepEqual(toValue(actionElement), {
        target: '$.paths.*.get.responses',
        description: 'Adds an error response',
        update: { '404': { description: 'Not Found' } },
      });
    });

    specify('should report the location within the document', async function () {
      const overlay = createOverlay({ $ref: '#/components/actions/missing', target: '$' });

      try {
        await resolveLone(overlay, { immutable: false });
        assert.fail('should throw UnresolvableReferenceError');
      } catch (error: unknown) {
        assert.instanceOf(error, UnresolvableReferenceError);
        assert.propertyVal(error, 'location', '/actions/0');
      }
    });

    specify('should throw when the ReferenceSet lacks the document', async function () {
      const overlay = createOverlay({
        $ref: '#/components/actions/errorResponse',
        target: '$',
      });

      try {
        await resolveLone(overlay, { withDocument: false });
        assert.fail('should throw UnresolvableReferenceError');
      } catch (error: unknown) {
        assert.instanceOf(error, UnresolvableReferenceError);
      }
    });
  });

  context('given invalid reference', function () {
    const cases: Array<[string, Record<string, unknown>, Record<string, unknown>?]> = [
      ['non-string $ref', { $ref: 1, target: '$' }],
      ['$ref outside components.actions', { $ref: '#/info', target: '$' }],
      ['external $ref', { $ref: 'other.yaml#/components/actions/errorResponse', target: '$' }],
      ['unescaped "/" in name', { $ref: '#/components/actions/error/response', target: '$' }],
      ['unescaped "~" in name', { $ref: '#/components/actions/error~response', target: '$' }],
      ['empty name', { $ref: '#/components/actions/', target: '$' }],
      ['malformed percent-encoding', { $ref: '#/components/actions/%E0%A4%A', target: '$' }],
      ['missing component', { $ref: '#/components/actions/missing', target: '$' }],
      [
        'target in reusable fields',
        { $ref: '#/components/actions/bad', target: '$' },
        { bad: { fields: { target: '$.info', remove: true } } },
      ],
      [
        'non-object reusable fields',
        { $ref: '#/components/actions/bad', target: '$' },
        { bad: { fields: 'not-an-object' } },
      ],
      [
        'update next to $ref',
        { $ref: '#/components/actions/errorResponse', target: '$', update: { a: 1 } },
      ],
      [
        'copy next to $ref',
        { $ref: '#/components/actions/errorResponse', target: '$', copy: '$.a' },
      ],
      [
        'remove next to $ref',
        { $ref: '#/components/actions/errorResponse', target: '$', remove: true },
      ],
    ];

    cases.forEach(([title, reference, actions]) => {
      specify(`should throw on ${title}`, async function () {
        const overlay = createOverlay(reference, actions);

        try {
          await resolve(overlay);
          assert.fail('should throw UnresolvableReferenceError');
        } catch (error: unknown) {
          assert.instanceOf(error, UnresolvableReferenceError);
        }
      });
    });
  });
});
