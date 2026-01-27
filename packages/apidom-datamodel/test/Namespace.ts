import { assert } from 'chai';
import { Namespace, JSONSerialiser, StringElement, Element } from '../src/index.ts';

describe('Namespace', function () {
  let namespace: Namespace;
  let NullElementClass: typeof Element;
  let ObjectElementClass: typeof Element;
  let StringElementClass: typeof Element;

  beforeEach(function () {
    namespace = new Namespace();
    namespace.elementMap = {};
    namespace.elementDetection = [];
    namespace.useDefault();

    NullElementClass = namespace.getElementClass('null');
    ObjectElementClass = namespace.getElementClass('object');
    StringElementClass = namespace.getElementClass('string');
  });

  specify('gets returned from new Namespace()', function () {
    assert.instanceOf(new Namespace(), Namespace);
  });

  describe('default elements', function () {
    specify('are present by default', function () {
      assert.isNotEmpty(namespace.elementMap);
    });

    specify('can be created empty', function () {
      assert.deepEqual(new Namespace({ noDefault: true }).elementMap, {});
    });

    specify('can be added after instantiation', function () {
      const testnamespace = new Namespace({ noDefault: true });
      testnamespace.useDefault();
      assert.isNotEmpty(testnamespace.elementMap);
    });
  });

  describe('#use', function () {
    specify('can load a plugin module using the namespace property', function () {
      const plugin = {
        namespace(options: { base: Namespace }) {
          const { base } = options;

          // Register a new element
          base.register('null2', NullElementClass);
        },
      };

      namespace.use(plugin);

      assert.strictEqual(namespace.elementMap.null2, NullElementClass);
    });

    specify('can load a plugin module using the load property', function () {
      const plugin = {
        load(options: { base: Namespace }) {
          const { base } = options;

          // Register a new element
          base.register('null3', NullElementClass);
        },
      };

      namespace.use(plugin);

      assert.strictEqual(namespace.elementMap.null3, NullElementClass);
    });
  });

  describe('#register', function () {
    specify('should add to the element map', function () {
      namespace.register('test', ObjectElementClass);
      assert.strictEqual(namespace.elementMap.test, ObjectElementClass);
    });
  });

  describe('#unregister', function () {
    specify('should remove from the element map', function () {
      namespace.unregister('test');
      assert.notProperty(namespace.elementMap, 'test');
    });
  });

  describe('#detect', function () {
    const test = () => true;

    specify('should prepend by default', function () {
      namespace.elementDetection = [[test, NullElementClass]];
      namespace.detect(test, StringElementClass);
      assert.strictEqual(namespace.elementDetection[0][1], StringElementClass);
    });

    specify('should be able to append', function () {
      namespace.elementDetection = [[test, NullElementClass]];
      namespace.detect(test, ObjectElementClass, false);
      assert.strictEqual(namespace.elementDetection[1][1], ObjectElementClass);
    });
  });

  describe('#getElementClass', function () {
    specify('should return ElementClass for unknown elements', function () {
      assert.strictEqual(namespace.getElementClass('unknown'), namespace.Element);
    });
  });

  describe('#elements', function () {
    specify('should contain registered element classes', function () {
      const { elements } = namespace;

      const elementValues = Object.keys(elements).map((name) => elements[name]);
      elementValues.shift();

      const mapValues = Object.keys(namespace.elementMap).map((name) => namespace.elementMap[name]);

      assert.deepEqual(elementValues, mapValues);
    });

    specify('should use pascal casing', function () {
      Object.keys(namespace.elements).forEach((name) => {
        assert.strictEqual(name[0], name[0].toUpperCase());
      });
    });

    specify('should contain the base element', function () {
      assert.strictEqual(namespace.elements.Element, namespace.Element);
    });
  });

  describe('#toElement', function () {
    specify('returns element when given element', function () {
      const element = new StringElement('hello');
      const toElement = namespace.toElement(element);

      assert.strictEqual(toElement, element);
    });

    specify('returns string element when given string', function () {
      const element = namespace.toElement('hello');

      assert.instanceOf(element, StringElement);
      assert.strictEqual(element.toValue(), 'hello');
    });
  });

  describe('serialisation', function () {
    specify('provides a convenience serialiser', function () {
      assert.instanceOf(namespace.serialiser, JSONSerialiser);
      assert.strictEqual(namespace.serialiser.namespace, namespace);
    });

    specify('provides a convenience fromRefract', function () {
      const element = namespace.fromRefract({
        element: 'string',
        content: 'hello',
      });

      assert.instanceOf(element, StringElement);
      assert.strictEqual(element.toValue(), 'hello');
    });

    specify('provides a convenience toRefract', function () {
      const element = new StringElement('hello');
      const object = namespace.toRefract(element);

      assert.deepEqual(object, {
        element: 'string',
        content: 'hello',
      });
    });
  });
});
