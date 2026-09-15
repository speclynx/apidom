import { assert } from 'chai';
import { ObjectElement, ArrayElement, NumberElement } from '@speclynx/apidom-datamodel';

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

    context('given comparison expressions', function () {
      context('given Nothing on both sides', function () {
        // https://github.com/swaggerexpert/jsonpath/issues/144
        const arrayElement = new ArrayElement([{}]);

        specify('should select with == operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a == @.b]'), [new ObjectElement({})]);
        });

        specify('should not select with != operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a != @.b]'), []);
        });

        specify('should select with <= operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a <= @.b]'), [new ObjectElement({})]);
        });

        specify('should select with >= operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a >= @.b]'), [new ObjectElement({})]);
        });

        specify('should not select with < operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a < @.b]'), []);
        });

        specify('should not select with > operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a > @.b]'), []);
        });
      });

      context('given Nothing on one side only', function () {
        const arrayElement = new ArrayElement([{ a: 1 }]);

        specify('should not select with == operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a == @.b]'), []);
        });

        specify('should select with != operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a != @.b]'), [new ObjectElement({ a: 1 })]);
        });

        specify('should not select with <= operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a <= @.b]'), []);
          assert.deepEqual(evaluate(arrayElement, '$[?@.b <= @.a]'), []);
        });

        specify('should not select with >= operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a >= @.b]'), []);
          assert.deepEqual(evaluate(arrayElement, '$[?@.b >= @.a]'), []);
        });

        specify('should not select with < operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a < @.b]'), []);
          assert.deepEqual(evaluate(arrayElement, '$[?@.b < @.a]'), []);
        });

        specify('should not select with > operator', function () {
          assert.deepEqual(evaluate(arrayElement, '$[?@.a > @.b]'), []);
          assert.deepEqual(evaluate(arrayElement, '$[?@.b > @.a]'), []);
        });
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
