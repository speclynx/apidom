import { assert } from 'chai';

import { NotImplementedError, UnsupportedOperationError } from '../src/index.ts';

describe('apidom-error', function () {
  context('NotImplementedError', function () {
    specify('should create error', function () {
      const error = new NotImplementedError('msg');

      assert.instanceOf(error, NotImplementedError);
      assert.instanceOf(error, UnsupportedOperationError);
      assert.strictEqual(error.message, 'msg');
      assert.strictEqual(error.name, 'NotImplementedError');
    });

    specify('should create error chain', function () {
      const cause = new Error('cause');
      const error = new NotImplementedError('msg', { cause });

      assert.instanceOf(error, NotImplementedError);
      assert.strictEqual(error.message, 'msg');
      assert.strictEqual(error.name, 'NotImplementedError');
      assert.strictEqual(error.cause, cause);
    });
  });
});
