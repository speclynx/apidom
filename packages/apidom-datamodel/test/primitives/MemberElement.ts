import { assert } from 'chai';
import { MemberElement } from '../../src/index.ts';

describe('MemberElement', function () {
  const member = new MemberElement('foo', 'bar', {}, { foo: 'bar' });

  context('key', function () {
    specify('provides the set key', function () {
      assert.strictEqual(member.key!.toValue(), 'foo');
    });

    specify('sets the key', function () {
      member.key = 'updated';
      assert.strictEqual(member.key!.toValue(), 'updated');
    });
  });

  context('value', function () {
    specify('provides the set value', function () {
      assert.strictEqual(member.value!.toValue(), 'bar');
    });

    specify('sets the key', function () {
      member.value = 'updated';
      assert.strictEqual(member.value!.toValue(), 'updated');
    });
  });

  specify('correctly sets the attributes', function () {
    assert.strictEqual(member.attributes.get('foo')!.toValue(), 'bar');
  });
});
