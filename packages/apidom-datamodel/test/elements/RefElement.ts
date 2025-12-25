import { assert } from 'chai';

import { RefElement, StringElement } from '../../src/index.ts';

describe('Ref Element', function () {
  specify('has ref element name', function () {
    const element = new RefElement();

    assert.strictEqual(element.element, 'ref');
  });

  specify('has a default path of element', function () {
    const element = new RefElement();

    assert.strictEqual(element.path!.toValue(), 'element');
  });

  specify('can set the ref element path', function () {
    const element = new RefElement();
    element.path = 'attributes';

    const path = element.attributes.get('path');

    assert.instanceOf(path, StringElement);
    assert.strictEqual(path.toValue(), 'attributes');
  });

  specify('can get the ref element path', function () {
    const element = new RefElement();
    element.attributes.set('path', 'attributes');

    assert.instanceOf(element.path, StringElement);
    assert.strictEqual(element.path.toValue(), 'attributes');
  });
});
