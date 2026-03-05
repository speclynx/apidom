import { assert } from 'chai';

import { Element, ObjectElement, StringElement } from '../../src/index.ts';

describe('Element whose meta has meta', function () {
  specify('returns the correct Refract value', function () {
    const object = new ObjectElement({
      foo: 'bar',
    });

    const string = new StringElement('xyz');
    string.meta.set('pqr', 1);

    object.meta.set('baz', string);

    const baz = object.meta.get('baz') as Element;
    assert.strictEqual(baz.meta.get('pqr'), 1);
  });
});
