import { assert } from 'chai';

import { applyAction, applyOverlay } from '../../../src/apply/realms/pojo.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJson = Record<string, any>;

describe('applyAction (POJO)', function () {
  specify('should apply update action', function () {
    const result = applyAction(
      { target: '$.info.title', update: 'New Title' },
      { info: { title: 'Old Title', version: '1.0.0' } },
    ) as AnyJson;

    assert.strictEqual(result.info.title, 'New Title');
    assert.strictEqual(result.info.version, '1.0.0');
  });

  specify('should apply remove action', function () {
    const result = applyAction(
      { target: '$.info.description', remove: true },
      { info: { title: 'API', description: 'Remove me' } },
    ) as AnyJson;

    assert.strictEqual(result.info.title, 'API');
    assert.isUndefined(result.info.description);
  });
});

describe('applyOverlay (POJO)', function () {
  specify('should apply full overlay document', function () {
    const result = applyOverlay(
      {
        overlay: '1.1.0',
        info: { title: 'Test overlay', version: '1.0.0' },
        actions: [
          { target: '$.info', update: { description: 'Added' } },
          { target: '$.info.title', update: 'Renamed' },
        ],
      },
      {
        openapi: '3.1.0',
        info: { title: 'Original', version: '1.0.0' },
      },
    ) as AnyJson;

    assert.strictEqual(result.info.title, 'Renamed');
    assert.strictEqual(result.info.description, 'Added');
    assert.strictEqual(result.info.version, '1.0.0');
  });
});
