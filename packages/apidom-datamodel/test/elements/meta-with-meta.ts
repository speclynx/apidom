import { assert } from 'chai';

import { ObjectElement, StringElement } from '../../src/index.ts';

describe('Element whose meta has meta', function () {
  specify('returns the correct Refract value', function () {
    const object = new ObjectElement({
      foo: 'bar',
    });

    const string = new StringElement('xyz');
    string.meta.set('pqr', 1);

    object.meta.set('baz', string);

    const pqr = object.meta.get('baz')!.meta.getValue('pqr');
    assert.strictEqual(pqr, 1);
  });
});
