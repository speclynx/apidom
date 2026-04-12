import { assert } from 'chai';
import { refract } from '@speclynx/apidom-datamodel';
import { refractAction } from '@speclynx/apidom-ns-overlay-1';

import OverlayError from '../src/errors/OverlayError.ts';
import { validateAction, validateTargetNodes } from '../src/validate.ts';

describe('validateAction', function () {
  context('given valid action with update', function () {
    specify('should return valid', function () {
      const action = refractAction({ target: '$.info', update: { title: 'New' } });
      const result = validateAction(action);
      assert.isTrue(result.valid);
      assert.isUndefined(result.error);
    });
  });

  context('given valid action with copy', function () {
    specify('should return valid', function () {
      const action = refractAction({ target: '$.info.title', copy: '$.info.description' });
      const result = validateAction(action);
      assert.isTrue(result.valid);
    });
  });

  context('given valid action with remove', function () {
    specify('should return valid', function () {
      const action = refractAction({ target: '$.info.description', remove: true });
      const result = validateAction(action);
      assert.isTrue(result.valid);
    });
  });

  context('given action without target', function () {
    specify('should return invalid with OverlayError', function () {
      const action = refractAction({ update: { title: 'New' } });
      const result = validateAction(action);
      assert.isFalse(result.valid);
      assert.instanceOf(result.error, OverlayError);
      assert.match(result.error!.message, /target/);
    });
  });

  context('given action with both update and copy', function () {
    specify('should return invalid with OverlayError', function () {
      const action = refractAction({ target: '$.info', update: {}, copy: '$.other' });
      const result = validateAction(action);
      assert.isFalse(result.valid);
      assert.instanceOf(result.error, OverlayError);
      assert.match(result.error!.message, /both/);
    });
  });
});

describe('validateTargetNodes', function () {
  context('given single node', function () {
    specify('should return valid', function () {
      const nodes = [refract({ title: 'API' })];
      assert.isTrue(validateTargetNodes(nodes).valid);
    });
  });

  context('given multiple nodes of same type (objects)', function () {
    specify('should return valid', function () {
      const nodes = [refract({ a: 1 }), refract({ b: 2 })];
      assert.isTrue(validateTargetNodes(nodes).valid);
    });
  });

  context('given multiple nodes of mixed types', function () {
    specify('should return invalid with OverlayError', function () {
      const nodes = [refract({ a: 1 }), refract('string')];
      const result = validateTargetNodes(nodes);
      assert.isFalse(result.valid);
      assert.instanceOf(result.error, OverlayError);
      assert.match(result.error!.message, /same type/);
    });
  });

  context('given empty array', function () {
    specify('should return valid', function () {
      assert.isTrue(validateTargetNodes([]).valid);
    });
  });
});
