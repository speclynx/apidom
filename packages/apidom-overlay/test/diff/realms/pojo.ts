import { assert } from 'chai';

import { diffPOJO } from '../../../src/diff/index.ts';
import { applyOverlay as applyOverlayPOJO } from '../../../src/apply/realms/pojo.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

describe('diffPOJO', function () {
  context('given identical documents', function () {
    specify('should produce an overlay with no actions', function () {
      const left = { info: { title: 'My API', version: '1.0.0' } };
      const right = { info: { title: 'My API', version: '1.0.0' } };

      const result = diffPOJO(left, right) as AnyJson;

      assert.isArray(result.actions);
      assert.strictEqual(result.actions.length, 0);
    });
  });

  context('given documents with changes', function () {
    specify('should produce a plain object overlay', function () {
      const left = { info: { title: 'Old', version: '1.0.0' } };
      const right = { info: { title: 'New', version: '2.0.0' } };

      const result = diffPOJO(left, right) as AnyJson;

      assert.isString(result.overlay);
      assert.isObject(result.info);
      assert.isArray(result.actions);
      assert.isAbove(result.actions.length, 0);
    });

    specify('should return a plain JavaScript object, not an Element', function () {
      const left = { info: { title: 'Old', version: '1.0.0' } };
      const right = { info: { title: 'New', version: '1.0.0' } };

      const result = diffPOJO(left, right) as AnyJson;

      assert.isObject(result);
      assert.isString(result.overlay);
      assert.isArray(result.actions);
      assert.isUndefined(result.element);
    });

    specify(
      'should produce overlay that when applied via applyOverlayPOJO yields right',
      function () {
        const left = { openapi: '3.1.0', info: { title: 'Old', version: '1.0.0' } };
        const right = { openapi: '3.1.0', info: { title: 'New', version: '2.0.0' } };

        const overlay = diffPOJO(left, right) as AnyJson;
        const result = applyOverlayPOJO(overlay, left);

        assert.deepEqual(result, right);
      },
    );
  });
});
