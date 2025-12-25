import { assert } from 'chai';

import { LinkElement } from '../../src/index.ts';

describe('Link Element', function () {
  context('when creating an instance of LinkElement', function () {
    let link: LinkElement;

    before(function () {
      link = new LinkElement();
      link.relation = 'foo';
      link.href = '/bar';
    });

    specify('sets the correct attributes', function () {
      assert.strictEqual(link.attributes.get('relation')!.toValue(), 'foo');
      assert.strictEqual(link.attributes.get('href')!.toValue(), '/bar');
    });

    specify('provides convenience methods', function () {
      assert.strictEqual(link.relation!.toValue(), 'foo');
      assert.strictEqual(link.href!.toValue(), '/bar');
    });
  });
});
