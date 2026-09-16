import { assert } from 'chai';

import { UnsupportedOperationError, ApiDOMError } from '../src/index.ts';

describe('apidom-error', function () {
  context('UnsupportedOperationError', function () {
    specify('should create error', function () {
      const error = new UnsupportedOperationError('msg');

      assert.instanceOf(error, UnsupportedOperationError);
      assert.instanceOf(error, ApiDOMError);
      assert.strictEqual(error.message, 'msg');
      assert.strictEqual(error.name, 'UnsupportedOperationError');
    });

    specify('should create error chain', function () {
      const cause = new Error('cause');
      const error = new UnsupportedOperationError('msg', { cause });

      assert.instanceOf(error, UnsupportedOperationError);
      assert.strictEqual(error.message, 'msg');
      assert.strictEqual(error.name, 'UnsupportedOperationError');
      assert.strictEqual(error.cause, cause);
    });
  });
});
