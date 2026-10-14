import { assert, expect } from 'chai';
import { toValue } from '@speclynx/apidom-core';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';

import {
  refractOverlay1,
  resolveReusableActionReference,
  isActionElement,
  type Overlay1Element,
  type ReusableActionElement,
  type ReusableActionReferenceElement,
} from '../src/index.ts';

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

const resolve = (overlay: Overlay1Element) =>
  resolveReusableActionReference(
    overlay.actions!.get(0) as ReusableActionReferenceElement,
    overlay,
  );

describe('resolveReusableActionReference', function () {
  specify('should resolve to an Action with reference target and reusable fields', function () {
    const overlay = createOverlay({
      $ref: '#/components/actions/errorResponse',
      target: '$.paths.*.get.responses',
    });
    const actionElement = resolve(overlay);

    assert.isTrue(isActionElement(actionElement));
    assert.deepEqual(toValue(actionElement), {
      target: '$.paths.*.get.responses',
      description: 'Adds an error response',
      update: { '404': { description: 'Not Found' } },
    });
  });

  specify('should prefer the reference description', function () {
    const overlay = createOverlay({
      $ref: '#/components/actions/errorResponse',
      target: '$',
      description: 'Overridden',
    });

    assert.strictEqual(toValue(resolve(overlay).description), 'Overridden');
  });

  specify('should not share elements with the overlay', function () {
    const overlay = createOverlay({ $ref: '#/components/actions/errorResponse', target: '$' });
    const actionElement = resolve(overlay);
    const reusableAction = overlay.components!.actions!.get(
      'errorResponse',
    ) as ReusableActionElement;

    assert.notStrictEqual(actionElement.update, reusableAction.fields!.update);
  });

  specify('should decode escaped component names', function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/error-response~1v1~0beta', target: '$' },
      { 'error-response/v1~beta': { fields: { remove: true } } },
    );

    assert.isTrue(toValue(resolve(overlay).removeField));
  });

  specify('should percent-decode the fragment', function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/error%20response', target: '$' },
      { 'error response': { fields: { remove: true } } },
    );

    assert.isTrue(toValue(resolve(overlay).removeField));
  });

  specify('should resolve reusable action without fields', function () {
    const overlay = createOverlay(
      { $ref: '#/components/actions/empty', target: '$' },
      { empty: {} },
    );

    assert.deepEqual(toValue(resolve(overlay)), { target: '$' });
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
    ];

    cases.forEach(([title, reference, actions]) => {
      specify(`should throw on ${title}`, function () {
        const overlay = createOverlay(reference, actions);

        expect(() => resolve(overlay)).to.throw(ApiDOMStructuredError);
      });
    });
  });
});
