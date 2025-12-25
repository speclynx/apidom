import { assert } from 'chai';

import {
  Namespace,
  StringElement,
  ArrayElement,
  JSONSerialiser,
  type Meta,
  type Attributes,
} from '../src/index.ts';

const minim = new Namespace();

describe('Minim subclasses', function () {
  class MyElement extends StringElement {
    constructor(content?: string, meta?: Meta, attributes?: Attributes) {
      super(content, meta, attributes);
      this.element = 'myElement';
    }

    ownMethod() {
      return 'It works!';
    }
  }
  minim.register('myElement', MyElement);

  specify('can extend the base element with its own method', function () {
    const myElement = new MyElement();
    assert.strictEqual(myElement.ownMethod(), 'It works!');
  });

  context('when initializing', function () {
    const myElement = new MyElement();

    specify('can overwrite the element name', function () {
      assert.strictEqual(myElement.element, 'myElement');
    });

    specify('returns the correct primitive element', function () {
      assert.strictEqual(myElement.primitive(), 'string');
    });
  });

  describe('deserializing attributes', function () {
    const myElement = minim.fromRefract({
      element: 'myElement',
      attributes: {
        headers: {
          element: 'array',
          content: [
            {
              element: 'string',
              meta: {
                name: {
                  element: 'string',
                  content: 'Content-Type',
                },
              },
              content: 'application/json',
            },
          ],
        },
        foo: {
          element: 'string',
          content: 'bar',
        },
        sourceMap: {
          element: 'sourceMap',
          content: [
            {
              element: 'string',
              content: 'test',
            },
          ],
        },
      },
    });

    specify('should create headers element instance', function () {
      assert.instanceOf(myElement.attributes.get('headers'), ArrayElement);
    });

    specify('should leave foo alone', function () {
      assert.instanceOf(myElement.attributes.get('foo'), StringElement);
    });

    specify('should create array of source map elements', function () {
      const sourceMaps = myElement.attributes.get('sourceMap');
      assert.strictEqual((sourceMaps!.content as unknown as Element[]).length, 1);
      assert.instanceOf((sourceMaps!.content as unknown as Element[])[0], StringElement);
      assert.strictEqual(
        ((sourceMaps!.content as unknown as Element[])[0] as unknown as StringElement).toValue(),
        'test',
      );
    });
  });

  describe('serializing attributes', function () {
    const myElement = new MyElement();

    myElement.attributes.set('headers', new ArrayElement(['application/json']));
    (
      (
        myElement.attributes.get('headers')!.content as unknown as Element[]
      )[0] as unknown as StringElement
    ).meta.set('name', 'Content-Type');

    myElement.attributes.set('sourceMap', ['string1', 'string2']);

    specify('should serialize element to JSON', function () {
      const serialiser = new JSONSerialiser(minim);
      const refracted = serialiser.serialise(myElement);

      assert.deepEqual(refracted, {
        element: 'myElement',
        attributes: {
          headers: {
            element: 'array',
            content: [
              {
                element: 'string',
                meta: {
                  name: {
                    element: 'string',
                    content: 'Content-Type',
                  },
                },
                content: 'application/json',
              },
            ],
          },
          sourceMap: {
            element: 'array',
            content: [
              {
                element: 'string',
                content: 'string1',
              },
              {
                element: 'string',
                content: 'string2',
              },
            ],
          },
        },
      });
    });

    specify('should round-trip using JSON serialiser', function () {
      const serialiser = new JSONSerialiser(minim);
      const object = serialiser.serialise(myElement);
      const element = serialiser.deserialise(object);
      const serialised = serialiser.serialise(element);

      assert.deepEqual(serialised, object);
    });
  });
});
