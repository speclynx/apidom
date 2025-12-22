import { assert } from 'chai';

import { evaluate } from '../src/index.ts';

describe('apidom-json-pointer', function () {
  it('should contain evaluate function', function () {
    assert.isFunction(evaluate);
  });
});
