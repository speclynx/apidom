import { assert } from 'chai';
import {
  Namespace,
  JSONSerialiser,
  KeyValuePair,
  Element,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
  ArrayElement,
  ObjectElement,
  MemberElement,
} from '../../src/index.ts';
import type { RefractDocument } from '../../src/index.ts';

describe('JSON Serialiser', function () {
  let serialiser: JSONSerialiser;
  let minim: Namespace;

  beforeEach(function () {
    minim = new Namespace();
    serialiser = new JSONSerialiser(minim);
  });

  describe('initialisation', function () {
    specify('uses given namespace', function () {
      assert.strictEqual(serialiser.namespace, minim);
    });

    specify('creates a default namespace when no namespace is given', function () {
      serialiser = new JSONSerialiser();
      assert.instanceOf(serialiser.namespace, Namespace);
    });
  });

  describe('serialisation', function () {
    // Type for accessing protected method
    type SerialiserWithProtectedMethods = {
      serialiseObject(element: ObjectElement): Record<string, unknown> | undefined;
    };

    describe('#serialiseObject', function () {
      specify('can serialise an ObjectElement', function () {
        const object = new ObjectElement({ id: 'Example' });
        const result = (serialiser as unknown as SerialiserWithProtectedMethods).serialiseObject(
          object,
        );

        assert.deepEqual(result, {
          id: {
            element: 'string',
            content: 'Example',
          },
        });
      });

      specify('can serialise an ObjectElement containg undefined key', function () {
        const object = new ObjectElement({ key: undefined });
        const result = (serialiser as unknown as SerialiserWithProtectedMethods).serialiseObject(
          object,
        );

        assert.deepEqual(result, undefined);
      });
    });

    specify('errors when serialising a non-element', function () {
      assert.throws(
        () => {
          serialiser.serialise('Hello' as unknown as Element);
        },
        TypeError,
        'Given element `Hello` is not an Element instance',
      );
    });

    specify('serialises a primitive element', function () {
      const element = new StringElement('Hello');
      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'string',
        content: 'Hello',
      });
    });

    specify('serialises an element containing element', function () {
      const string = new StringElement('Hello');
      const element = new Element(string);
      element.element = 'custom';

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello',
        },
      });
    });

    specify('serialises an element containing element array', function () {
      const string = new StringElement('Hello');
      const element = new ArrayElement([string]);

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello',
          },
        ],
      });
    });

    specify('serialises an element containing an empty array', function () {
      const element = new ArrayElement();

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'array',
      });
    });

    specify('serialises an element containing a pair', function () {
      const name = new StringElement('name');
      const doe = new StringElement('Doe');
      const element = new MemberElement(name, doe);

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
          value: {
            element: 'string',
            content: 'Doe',
          },
        },
      });
    });

    specify('serialises an element containing a pair without a value', function () {
      const name = new StringElement('name');
      const element = new MemberElement(name);

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
        },
      });
    });

    specify('serialises an elements meta', function () {
      const doe = new StringElement('Doe');
      doe.title = 'Name';

      const object = serialiser.serialise(doe);

      assert.deepEqual(object, {
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'Name',
          },
        },
        content: 'Doe',
      });
    });

    specify('serialises an elements attributes', function () {
      const element = new StringElement('Hello World');
      element.attributes.set('thread', 123);

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'string',
        attributes: {
          thread: {
            element: 'number',
            content: 123,
          },
        },
        content: 'Hello World',
      });
    });

    specify('serialises an element with custom element attributes', function () {
      const element = new StringElement('Hello World');
      element.attributes.set('thread', new Element(123));

      const object = serialiser.serialise(element);

      assert.deepEqual(object, {
        element: 'string',
        attributes: {
          thread: {
            element: 'element',
            content: 123,
          },
        },
        content: 'Hello World',
      });
    });
  });

  describe('deserialisation', function () {
    specify('errors when deserialising value without element name', function () {
      assert.throws(() => serialiser.deserialise({} as RefractDocument));
    });

    specify('deserialise from a JSON object', function () {
      const element = serialiser.deserialise({
        element: 'string',
        content: 'Hello',
      });

      assert.instanceOf(element, StringElement);
      assert.strictEqual(element.content, 'Hello');
    });

    specify('deserialise from a JSON object containing an sub-element', function () {
      const element = serialiser.deserialise({
        element: 'custom',
        content: {
          element: 'string',
          content: 'Hello',
        },
      });

      assert.instanceOf(element, Element);
      assert.instanceOf(element.content, StringElement);
      assert.strictEqual((element.content as StringElement).content, 'Hello');
    });

    specify('deserialise from a JSON object containing an array of elements', function () {
      const element = serialiser.deserialise({
        element: 'array',
        content: [
          {
            element: 'string',
            content: 'Hello',
          },
        ],
      });

      assert.instanceOf(element, ArrayElement);
      assert.instanceOf((element.content as Element[])[0], StringElement);
      assert.strictEqual(((element.content as Element[])[0] as StringElement).content, 'Hello');
    });

    specify('deserialise from a JSON object containing a key-value pair', function () {
      const element = serialiser.deserialise({
        element: 'member',
        content: {
          key: {
            element: 'string',
            content: 'name',
          },
          value: {
            element: 'string',
            content: 'Doe',
          },
        },
      });

      assert.instanceOf(element, MemberElement);
      assert.instanceOf(element.content, KeyValuePair);
      assert.instanceOf(element.key, StringElement);
      assert.strictEqual(element.key.content, 'name');
      assert.instanceOf(element.value, StringElement);
      assert.strictEqual((element.value as StringElement).content, 'Doe');
    });

    specify(
      'deserialise from a JSON object containing a key-value pair without value',
      function () {
        const element = serialiser.deserialise({
          element: 'member',
          content: {
            key: {
              element: 'string',
              content: 'name',
            },
          },
        });

        assert.instanceOf(element, MemberElement);
        assert.instanceOf(element.content, KeyValuePair);
        assert.instanceOf(element.key, StringElement);
        assert.strictEqual(element.key.content, 'name');
        assert.isUndefined(element.value);
      },
    );

    specify('deserialise meta', function () {
      const element = serialiser.deserialise({
        element: 'string',
        meta: {
          title: {
            element: 'string',
            content: 'hello',
          },
        },
      });

      assert.instanceOf(element.title, StringElement);
      assert.strictEqual((element.title as StringElement).content, 'hello');
    });

    specify('deserialise attributes', function () {
      const element = serialiser.deserialise({
        element: 'string',
        attributes: {
          thing: {
            element: 'string',
            content: 'hello',
          },
        },
      });

      const attribute = element.attributes.get('thing');
      assert.instanceOf(attribute, StringElement);
      assert.strictEqual(attribute.content, 'hello');
    });

    describe('deserialising base elements', function () {
      specify('deserialise string', function () {
        const element = serialiser.deserialise({
          element: 'string',
          content: 'Hello',
        });

        assert.instanceOf(element, StringElement);
        assert.strictEqual(element.content, 'Hello');
      });

      specify('deserialise number', function () {
        const element = serialiser.deserialise({
          element: 'number',
          content: 15,
        });

        assert.instanceOf(element, NumberElement);
        assert.strictEqual(element.content, 15);
      });

      specify('deserialise boolean', function () {
        const element = serialiser.deserialise({
          element: 'boolean',
          content: true,
        });

        assert.instanceOf(element, BooleanElement);
        assert.strictEqual(element.content, true);
      });

      specify('deserialise null', function () {
        const element = serialiser.deserialise({
          element: 'null',
        });

        assert.instanceOf(element, NullElement);
      });

      specify('deserialise an array', function () {
        const object = serialiser.deserialise({
          element: 'array',
          content: [],
        });

        assert.instanceOf(object, ArrayElement);
        assert.deepEqual(object.content, []);
      });

      specify('deserialise an object', function () {
        const object = serialiser.deserialise({
          element: 'object',
          content: [],
        });

        assert.instanceOf(object, ObjectElement);
        assert.deepEqual(object.content, []);
      });

      specify('deserialise string without content', function () {
        const element = serialiser.deserialise({
          element: 'string',
        });

        assert.instanceOf(element, StringElement);
        assert.isUndefined(element.content);
      });

      specify('deserialise number without content', function () {
        const element = serialiser.deserialise({
          element: 'number',
        });

        assert.instanceOf(element, NumberElement);
        assert.isUndefined(element.content);
      });

      specify('deserialise boolean without content', function () {
        const element = serialiser.deserialise({
          element: 'boolean',
        });

        assert.instanceOf(element, BooleanElement);
        assert.isUndefined(element.content);
      });

      specify('deserialise an array without content', function () {
        const object = serialiser.deserialise({
          element: 'array',
        });

        assert.instanceOf(object, ArrayElement);
        assert.deepEqual(object.content, []);
      });

      specify('deserialise an object without content', function () {
        const object = serialiser.deserialise({
          element: 'object',
        });

        assert.instanceOf(object, ObjectElement);
        assert.deepEqual(object.content, []);
      });
    });
  });
});
