import { assert } from 'chai';

import { ArrayElement, Element, Namespace } from '../../src/index.ts';

describe('ArrayElement', function () {
  const thisArg = { message: 42 };

  context('value methods', function () {
    let arrayElement: ArrayElement;

    function setArray() {
      arrayElement = new ArrayElement(['a', true, null, 1]);
    }

    before(function () {
      setArray();
    });

    beforeEach(function () {
      setArray();
    });

    describe('.content', function () {
      specify('stores the correct elements', function () {
        const correctElementNames = ['string', 'boolean', 'null', 'number'];
        const storedElementNames = (arrayElement.content as Element[]).map(
          (el: Element) => el.element,
        );
        assert.deepEqual(storedElementNames, correctElementNames);
      });
    });

    describe('#element', function () {
      specify('is an array', function () {
        assert.strictEqual(arrayElement.element, 'array');
      });
    });

    describe('#primitive', function () {
      specify('returns array as the Refract primitive', function () {
        assert.strictEqual(arrayElement.primitive(), 'array');
      });
    });

    describe('#get', function () {
      context('when an index is given', function () {
        specify('returns the item from the array', function () {
          assert.strictEqual(arrayElement.get(0)!.toValue(), 'a');
        });
      });

      context('when no index is given', function () {
        specify('is undefined', function () {
          assert.isUndefined(arrayElement.get(undefined as unknown as number));
        });
      });
    });

    describe('#getValue', function () {
      context('when an index is given', function () {
        specify('returns the item from the array', function () {
          assert.strictEqual(arrayElement.getValue(0), 'a');
        });
      });

      context('when no index is given', function () {
        specify('is undefined', function () {
          assert.isUndefined(arrayElement.getValue(undefined as unknown as number));
        });
      });
    });

    describe('#get (by index)', function () {
      const numbers = new ArrayElement([1, 2, 3, 4]);

      specify('returns the correct item', function () {
        assert.strictEqual(numbers.get(1)!.toValue(), 2);
      });
    });

    describe('#set', function () {
      specify('sets the value of the array', function () {
        arrayElement.set(0, 'hello world');
        assert.strictEqual(arrayElement.get(0)!.toValue(), 'hello world');
      });
    });

    describe('#map', function () {
      specify('allows for mapping the content of the array', function () {
        const newArray = arrayElement.map(function map(this: typeof thisArg, item) {
          assert.deepEqual(this, thisArg);
          return item.toValue();
        }, thisArg);
        assert.deepEqual(newArray, ['a', true, null, 1]);
      });
    });

    describe('#flatMap', function () {
      /**
       * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap#Examples
       */
      specify('provides flatMap to flatten one level', function () {
        const arr1 = new ArrayElement([1, 2, 3, 4]);

        const mapped = arr1.map((x) => [(x.toValue() as number) * 2]);

        assert.deepEqual(mapped, [[2], [4], [6], [8]]);

        const flattened = arr1.flatMap((x) => [(x.toValue() as number) * 2]);

        assert.deepEqual(flattened, [2, 4, 6, 8]);

        const flattenOnce = arr1.flatMap((x) => [[(x.toValue() as number) * 2]]);

        assert.deepEqual(flattenOnce, [[2], [4], [6], [8]]);
      });
    });

    describe('#compactMap', function () {
      specify('allows compact mapping the content of the array', function () {
        const newArray = arrayElement.compactMap(function compactMap(this: typeof thisArg, item) {
          assert.deepEqual(this, thisArg);

          if (item.element === 'string' || item.element === 'number') {
            return item.toValue();
          }

          return undefined;
        }, thisArg);
        assert.deepEqual(newArray, ['a', 1]);
      });
    });

    describe('#filter', function () {
      specify('allows for filtering the content', function () {
        const newArray = arrayElement.filter(function filter(this: typeof thisArg, item) {
          assert.deepEqual(this, thisArg);
          const ref = item.toValue();
          return ref === 'a' || ref === 1;
        }, thisArg);
        assert.deepEqual(newArray.toValue(), ['a', 1]);
      });
    });

    describe('#reject', function () {
      specify('allows for rejecting the content', function () {
        const newArray = arrayElement.reject(function (this: typeof thisArg, item) {
          assert.deepEqual(this, thisArg);
          const ref = item.toValue();
          return ref === 'a' || ref === 1;
        }, thisArg);
        assert.deepEqual(newArray.toValue(), [true, null]);
      });
    });

    describe('#reduce', function () {
      const numbers = new ArrayElement([1, 2, 3, 4]);

      specify('sends index and array elements', function () {
        type ToValueType = { toValue: () => number };
        const sum = numbers.reduce((result, item, index, array) => {
          assert.isTrue(index < numbers.length);
          assert.strictEqual(array, numbers);

          return (result as unknown as ToValueType).toValue() + index;
        }, 0);

        // Sum of indexes should be 0 + 1 + 2 + 3 = 6
        assert.strictEqual((sum as unknown as ToValueType).toValue(), 6);
      });

      context('when no beginning value is given', function () {
        specify('correctly reduces the array', function () {
          type ToValueType = { toValue: () => number };
          const total = numbers.reduce(
            (result, item) =>
              (result as unknown as ToValueType).toValue() + (item.toValue() as number),
          );
          assert.strictEqual((total as unknown as ToValueType).toValue(), 10);
        });
      });

      context('when a beginning value is given', function () {
        specify('correctly reduces the array', function () {
          type ToValueType = { toValue: () => number };
          const total = numbers.reduce(
            (result, item) =>
              (result as unknown as ToValueType).toValue() + (item.toValue() as number),
            20,
          );
          assert.strictEqual((total as unknown as ToValueType).toValue(), 30);
        });
      });
    });

    describe('#forEach', function () {
      specify('iterates over each item', function () {
        const indexes: number[] = [];
        const results: Element[] = [];

        arrayElement.forEach(function forEach(this: typeof thisArg, item, index) {
          indexes.push(index);
          results.push(item);
          assert.deepEqual(this, thisArg);
        }, thisArg);

        assert.strictEqual(results.length, 4);
        assert.deepEqual(indexes, [0, 1, 2, 3]);
      });
    });

    describe('#length', function () {
      specify('returns the length of the content', function () {
        assert.strictEqual(arrayElement.length, 4);
      });
    });

    describe('#isEmpty', function () {
      specify('returns empty when there are no elements', function () {
        assert.isTrue(new ArrayElement().isEmpty);
      });

      specify('returns non empty when there are elements', function () {
        assert.isFalse(arrayElement.isEmpty);
      });
    });

    describe('#remove', function () {
      specify('removes the specified item', function () {
        const removed = arrayElement.remove(0);

        assert.strictEqual(removed!.toValue(), 'a');
        assert.strictEqual(arrayElement.length, 3);
      });

      specify('removing unknown item', function () {
        const removed = arrayElement.remove(10);

        assert.isNull(removed);
      });
    });

    function itAddsToArray(instance: ArrayElement) {
      assert.strictEqual(instance.length, 5);
      assert.strictEqual(instance.get(4)!.toValue(), 'foobar');
    }

    describe('#shift', function () {
      specify('removes an item from the start of an array', function () {
        const shifted = arrayElement.shift();
        assert.strictEqual(arrayElement.length, 3);
        assert.strictEqual(shifted!.toValue(), 'a');
      });
    });

    describe('#unshift', function () {
      specify('adds a new item to the start of the array', function () {
        arrayElement.unshift('foobar');
        assert.strictEqual(arrayElement.length, 5);
        assert.strictEqual(arrayElement.get(0)!.toValue(), 'foobar');
      });
    });

    describe('#push', function () {
      specify('adds a new item to the end of the array', function () {
        arrayElement.push('foobar');
        itAddsToArray(arrayElement);
      });
    });

    if (typeof Symbol !== 'undefined') {
      describe('#[Symbol.iterator]', function () {
        specify('can be used in a for ... of loop', function () {
          // We know the runtime supports Symbol but don't know if it supports
          // the actual `for ... of` loop syntax. Here we simulate it by
          // directly manipulating the iterator the same way that `for ... of`
          // does.
          const items: Element[] = [];
          const iterator = arrayElement[Symbol.iterator]();
          let result: IteratorResult<Element>;

          do {
            result = iterator.next();

            if (!result.done) {
              items.push(result.value);
            }
          } while (!result.done);

          assert.lengthOf(items, 4);
        });
      });
    }
  });

  describe('searching', function () {
    const refract = {
      element: 'array',
      content: [
        {
          element: 'string',
          content: 'foobar',
        },
        {
          element: 'string',
          content: 'hello world',
        },
        {
          element: 'array',
          content: [
            {
              element: 'string',
              meta: {
                classes: {
                  element: 'array',
                  content: [
                    {
                      element: 'string',
                      content: 'test-class',
                    },
                  ],
                },
              },
              content: 'baz',
            },
            {
              element: 'boolean',
              content: true,
            },
            {
              element: 'array',
              content: [
                {
                  element: 'string',
                  meta: {
                    id: {
                      element: 'string',
                      content: 'nested-id',
                    },
                  },
                  content: 'bar',
                },
                {
                  element: 'number',
                  content: 4,
                },
              ],
            },
          ],
        },
      ],
    };

    let doc: ArrayElement;
    let strings: ArrayElement;
    let recursiveStrings: ArrayElement;

    before(function () {
      doc = new Namespace().fromRefract(refract) as ArrayElement;
      strings = doc.filter((el) => el.element === 'string');
      recursiveStrings = doc.find((el) => el.element === 'string');
    });

    describe('#children', function () {
      specify('returns the correct number of items', function () {
        assert.strictEqual(strings.length, 2);
      });

      specify('returns the correct values', function () {
        assert.deepEqual(strings.toValue(), ['foobar', 'hello world']);
      });
    });

    describe('#find', function () {
      specify('returns the correct number of items', function () {
        assert.lengthOf(recursiveStrings, 4);
      });

      specify('returns the correct values', function () {
        assert.deepEqual(recursiveStrings.toValue(), ['foobar', 'hello world', 'baz', 'bar']);
      });
    });

    describe('#findByElement', function () {
      let items: ArrayElement;

      before(function () {
        items = doc.findByElement('number');
      });

      specify('returns the correct number of items', function () {
        assert.lengthOf(items, 1);
      });

      specify('returns the correct values', function () {
        assert.deepEqual(items.toValue(), [4]);
      });
    });

    describe('#findByClass', function () {
      let items: ArrayElement;

      before(function () {
        items = doc.findByClass('test-class');
      });

      specify('returns the correct number of items', function () {
        assert.lengthOf(items, 1);
      });

      specify('returns the correct values', function () {
        assert.deepEqual(items.toValue(), ['baz']);
      });
    });

    describe('#first', function () {
      specify('returns the first item', function () {
        assert.deepEqual(doc.first, (doc.content as Element[])[0]);
      });
    });

    describe('#second', function () {
      specify('returns the second item', function () {
        assert.deepEqual(doc.second, (doc.content as Element[])[1]);
      });
    });

    describe('#last', function () {
      specify('returns the last item', function () {
        assert.deepEqual(doc.last, (doc.content as Element[])[2]);
      });
    });

    describe('#getById', function () {
      specify('returns the item for the ID given', function () {
        assert.strictEqual(doc.getById('nested-id')!.toValue(), 'bar');
      });
    });

    describe('#includes', function () {
      specify('uses deep equality', function () {
        assert.isFalse((doc.get(2)! as ArrayElement).includes(['not', 'there']));
        assert.isTrue((doc.get(2)! as ArrayElement).includes(['bar', 4]));
      });

      context('when given a value that is in the array', function () {
        specify('returns true', function () {
          assert.isTrue(doc.includes('foobar'));
        });
      });

      context('when given a value that is not in the array', function () {
        specify('returns false', function () {
          assert.isFalse(doc.includes('not-there'));
        });
      });
    });
  });
});
