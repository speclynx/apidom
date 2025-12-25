import { assert } from 'chai';

import { ArrayElement, Namespace, Element } from '../../src/index.ts';

// Fantasy Land method names
const fl = {
  map: 'fantasy-land/map',
  concat: 'fantasy-land/concat',
  empty: 'fantasy-land/empty',
  filter: 'fantasy-land/filter',
  chain: 'fantasy-land/chain',
  reduce: 'fantasy-land/reduce',
} as const;

// Fantasy Land interface for type safety
interface FantasyLandArrayElement {
  'fantasy-land/map': (fn: (element: Element) => Element) => ArrayElement;
  'fantasy-land/concat': (other: ArrayElement) => ArrayElement;
  'fantasy-land/empty': () => ArrayElement;
  'fantasy-land/filter': (fn: (element: Element) => boolean) => ArrayElement;
  'fantasy-land/chain': (fn: (element: Element) => ArrayElement) => ArrayElement;
  'fantasy-land/reduce': <U>(fn: (acc: U, element: Element) => U, initial: U) => U;
}

interface FantasyLandArrayElementConstructor {
  'fantasy-land/empty': () => ArrayElement;
}

describe('ArrayElement', function () {
  const namespace = new Namespace();
  const array = new ArrayElement([1, 2, 3, 4]);

  describe('Functor', function () {
    specify('can transform elements into new ArrayElement', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.map](
        (n: Element) => new namespace.elements.Number((n.toValue() as number) * 2),
      );

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), [2, 4, 6, 8]);
    });
  });

  describe('Semigroup', function () {
    specify('can concatinate two array elements', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.concat](
        new ArrayElement([5, 6]),
      );

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), [1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Monoid', function () {
    specify('can create an empty ArrayElement', function () {
      const result = (ArrayElement as unknown as FantasyLandArrayElementConstructor)[fl.empty]();

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), []);
    });

    specify('can create an empty ArrayElement from another ArrayElement', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.empty]();

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), []);
    });
  });

  describe('Filterable', function () {
    specify('can filter all elements into equivilent ArrayElement', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.filter](() => true);

      assert.deepEqual(result, array);
    });

    specify('can filter into empty ArrayElement', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.filter](() => false);

      assert.instanceOf(result, ArrayElement);
      assert.isTrue(result.isEmpty);
    });
  });

  describe('Chain', function () {
    specify('can transform and chain results into new ArrayElement', function () {
      const duplicate = (n: Element) => new ArrayElement([n, n]);
      const result = (array as unknown as FantasyLandArrayElement)[fl.chain](duplicate);

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), [1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });

  describe('Foldable', function () {
    specify('can reduce results into new ArrayElement', function () {
      const result = (array as unknown as FantasyLandArrayElement)[fl.reduce](
        (accumulator: ArrayElement, element: Element) =>
          accumulator.concat(
            new ArrayElement([element.toValue() as number, element.toValue() as number]),
          ) as ArrayElement,
        new ArrayElement(),
      );

      assert.instanceOf(result, ArrayElement);
      assert.deepEqual(result.toValue(), [1, 1, 2, 2, 3, 3, 4, 4]);
    });
  });
});
