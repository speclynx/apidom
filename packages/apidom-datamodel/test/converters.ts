import { assert } from 'chai';

import { Namespace, Element } from '../src/index.ts';

const minim = new Namespace();

describe('Minim Converters', function () {
  describe('convertToElement', function () {
    function elementCheck(name: string, val: unknown) {
      context(`when given ${name}`, function () {
        specify(`returns ${name}`, function () {
          const returnedElement = minim.toElement(val)!;
          assert.strictEqual(returnedElement.element, name);
        });
      });
    }

    elementCheck('null', null);
    elementCheck('string', 'foobar');
    elementCheck('number', 1);
    elementCheck('boolean', true);
    elementCheck('array', [1, 2, 3]);
    elementCheck('object', {
      foo: 'bar',
    });
  });

  describe('convertFromElement', function () {
    function elementCheck(name: string, el: Record<string, unknown>) {
      context(`when given ${name}`, function () {
        let returnedElement: Element;

        before(function () {
          returnedElement = minim.fromRefract(el);
        });

        specify(`returns ${name} element`, function () {
          assert.strictEqual(returnedElement.element, name);
        });

        specify('has the correct value', function () {
          assert.strictEqual(returnedElement.toValue(), el.content);
        });
      });
    }

    elementCheck('null', {
      element: 'null',
      content: null,
    });

    elementCheck('string', {
      element: 'string',
      content: 'foo',
    });

    elementCheck('number', {
      element: 'number',
      content: 4,
    });

    elementCheck('boolean', {
      element: 'boolean',
      content: true,
    });

    context('when given array', function () {
      const el = {
        element: 'array',
        content: [
          {
            element: 'number',
            content: 1,
          },
          {
            element: 'number',
            content: 2,
          },
        ],
      };
      let returnedElement: Element;

      before(function () {
        returnedElement = minim.fromRefract(el);
      });

      specify('returns array element', function () {
        assert.strictEqual(returnedElement.element, 'array');
      });

      specify('has the correct values', function () {
        assert.deepEqual(returnedElement.toValue(), [1, 2]);
      });
    });

    context('when given object', function () {
      const el = {
        element: 'object',
        meta: {},
        attributes: {},
        content: [
          {
            element: 'member',
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'foo',
              },
              value: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'bar',
              },
            },
          },
          {
            element: 'member',
            meta: {},
            attributes: {},
            content: {
              key: {
                element: 'string',
                meta: {},
                attributes: {},
                content: 'z',
              },
              value: {
                element: 'number',
                meta: {},
                attributes: {},
                content: 2,
              },
            },
          },
        ],
      };
      let returnedElement: Element;

      before(function () {
        returnedElement = minim.fromRefract(el);
      });

      specify('returns object element', function () {
        assert.strictEqual(returnedElement.element, 'object');
      });

      specify('has the correct values', function () {
        assert.deepEqual(returnedElement.toValue(), {
          foo: 'bar',
          z: 2,
        });
      });
    });
  });
});
