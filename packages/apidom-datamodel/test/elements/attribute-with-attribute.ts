import { assert } from 'chai';

import { ObjectElement, StringElement } from '../../src/index.ts';

describe('Element whose attribute has attribute', function () {
  specify('returns the correct Refract value', function () {
    const object = new ObjectElement({
      foo: 'bar',
    });

    const string = new StringElement('xyz');
    string.attributes.set('pqr', 1);

    object.attributes.set('baz', string);

    const value = object.attributes.get('baz')!.attributes.get('pqr')!.toValue();
    assert.strictEqual(value, 1);
  });
});
