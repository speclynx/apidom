import { assert } from 'chai';
import { ObjectElement, NumberElement } from '@speclynx/apidom-datamodel';

import { evaluate } from '../src/index.ts';

describe('apidom-json-path', function () {
  context('evaluate', function () {
    context('given JSONPath expression as string', function () {
      specify('should retrieve end point values', function () {
        const objectElement = new ObjectElement({
          a: {
            b: [100, 1, 2],
          },
        });
        const result = evaluate(objectElement, '$.a.b[?(@ < 10)]');

        assert.deepEqual(result, [new NumberElement(1), new NumberElement(2)]);
      });
    });

    context('given wildcard expression', function () {
      specify('should retrieve all values', function () {
        const objectElement = new ObjectElement({
          a: {
            b: [1, 2, 3],
          },
        });
        const result = evaluate(objectElement, '$.a.b[*]');

        assert.deepEqual(result, [
          new NumberElement(1),
          new NumberElement(2),
          new NumberElement(3),
        ]);
      });
    });

    context('given invalid JSONPath expression', function () {
      specify('should throw error', function () {
        const objectElement = new ObjectElement({
          a: {
            b: [100, 1, 2],
          },
        });

        assert.throws(() => {
          evaluate(objectElement, '%~!@U@IU$@');
        });
      });
    });
  });
});
