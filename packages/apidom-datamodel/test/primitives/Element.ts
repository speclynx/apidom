import { assert } from 'chai';

import {
  Element,
  StringElement,
  BooleanElement,
  ObjectElement,
  ArrayElement,
  MemberElement,
  LinkElement,
  RefElement,
  ObjectSlice,
  KeyValuePair,
  Namespace,
} from '../../src/index.ts';

describe('Element', function () {
  context('when initializing', function () {
    specify('should initialize the correct meta data', function () {
      const element = new Element(
        {},
        {
          id: 'foobar',
          classes: ['a', 'b'],
          title: 'Title',
          description: 'Description',
        },
      );

      assert.strictEqual(element.meta.get('id')!.toValue(), 'foobar');
      assert.deepEqual(element.meta.get('classes')!.toValue(), ['a', 'b']);
      assert.strictEqual(element.meta.get('title')!.toValue(), 'Title');
      assert.strictEqual(element.meta.get('description')!.toValue(), 'Description');
    });

    specify('should allow initialising with meta object', function () {
      const meta = new ObjectElement();
      meta.set('id', 'foobar');
      const element = new Element(null, meta);

      assert.strictEqual(element.meta.get('id')!.toValue(), 'foobar');
    });

    specify('should allow initialising with attributes object', function () {
      const attributes = new ObjectElement();
      attributes.set('test', 'foobar');
      const element = new Element(null, undefined, attributes);

      assert.strictEqual(element.attributes.get('test')!.toValue(), 'foobar');
    });
  });

  describe('when initializing with value', function () {
    let el: Element;

    specify('should properly default to undefined', function () {
      el = new Element();
      assert.strictEqual(el.toValue(), undefined);
    });

    specify('should properly serialize falsey string', function () {
      el = new Element('');
      assert.strictEqual(el.toValue(), '');
    });

    specify('should properly serialize falsey number', function () {
      el = new Element(0);
      assert.strictEqual(el.toValue(), 0);
    });

    specify('should properly serialize falsey boolean', function () {
      el = new Element(false);
      assert.strictEqual(el.toValue(), false);
    });

    specify('should not be frozen', function () {
      el = new Element('');
      assert.isFalse(el.isFrozen);
    });
  });

  describe('#meta', function () {
    let element: Element;

    before(function () {
      element = new Element();
      element.meta.set('title', 'test');
    });

    specify('retains the correct values', function () {
      assert.strictEqual(element.meta.getValue('title'), 'test');
    });

    specify('allows setting new attributes', function () {
      element.meta = { title: 'test2' };
      assert.strictEqual(element.meta.getValue('title'), 'test2');
    });
  });

  describe('#attributes', function () {
    let element: Element;

    before(function () {
      element = new Element();
      element.attributes.set('foo', 'bar');
    });

    specify('retains the correct values', function () {
      assert.strictEqual(element.attributes.getValue('foo'), 'bar');
    });

    specify('allows setting new attributes', function () {
      element.attributes = { test: 'bar' };
      assert.strictEqual(element.attributes.getValue('test'), 'bar');
    });
  });

  describe('#content', function () {
    let element: Element;

    before(function () {
      element = new Element();
    });

    specify('should allow setting undefined', function () {
      element.content = undefined;

      assert.strictEqual(element.content, undefined);
    });

    specify('should allow setting null', function () {
      element.content = null;

      assert.strictEqual(element.content, null);
    });

    specify('should allow setting boolean value', function () {
      element.content = true;

      assert.strictEqual(element.content, true);
    });

    specify('should allow setting string value', function () {
      element.content = '';

      assert.strictEqual(element.content, '');
    });

    specify('should allow setting number value', function () {
      element.content = 5;

      assert.strictEqual(element.content, 5);
    });

    specify('should allow setting element value', function () {
      element.content = new Element();

      assert.deepEqual(element.content, new Element());
    });

    specify('should allow setting array of elements', function () {
      element.content = [new Element(1)];

      assert.deepEqual(element.content, [new Element(1)]);
    });

    specify('should allow setting array of non-elements', function () {
      element.content = [true];

      assert.deepEqual(element.content, [new BooleanElement(true)]);
    });

    specify('should allow setting object', function () {
      element.content = {
        name: 'Doe',
      };

      assert.deepEqual(element.content, [new MemberElement('name', 'Doe')]);
    });

    specify('should allow setting KeyValuePair', function () {
      element.content = new KeyValuePair();

      assert.deepEqual(element.content, new KeyValuePair());
    });

    specify('should allow setting ObjectSlice (converted to array)', function () {
      element.content = new ObjectSlice([new MemberElement('name', 'Doe')]);

      assert.deepEqual(element.content, [new MemberElement('name', 'Doe')]);
    });
  });

  describe('#element', function () {
    context('when getting an element that has not been set', function () {
      specify('returns base element', function () {
        const el = new Element();
        assert.strictEqual(el.element, 'element');
      });
    });

    context('when setting the element', function () {
      specify('sets the element correctly', function () {
        const el = new Element();
        el.element = 'foobar';
        assert.strictEqual(el.element, 'foobar');
      });
    });
  });

  describe('#primitive', function () {
    specify('returns undefined primitive', function () {
      const element = new Element();
      assert.isUndefined(element.primitive());
    });
  });

  describe('#equals', function () {
    let el: ObjectElement;

    before(function () {
      el = new ObjectElement(
        {
          foo: 'bar',
        },
        {
          id: 'foobar',
        },
      );
    });

    specify('returns true when they are equal', function () {
      assert.isTrue(el.meta.get('id')!.equals('foobar'));
    });

    specify('returns false when they are not equal', function () {
      assert.isFalse(el.meta.get('id')!.equals('not-equal'));
    });

    specify('does a deep equality check', function () {
      assert.isTrue(el.equals({ foo: 'bar' }));
      assert.isFalse(el.equals({ foo: 'baz' }));
    });

    specify('compares element to another element', function () {
      const el1 = new StringElement('hello');
      const el2 = new StringElement('hello');
      const el3 = new StringElement('world');

      assert.isTrue(el1.equals(el2));
      assert.isFalse(el1.equals(el3));
    });

    specify('compares complex element to another complex element', function () {
      const el1 = new ObjectElement({ foo: 'bar', nested: { a: 1 } });
      const el2 = new ObjectElement({ foo: 'bar', nested: { a: 1 } });
      const el3 = new ObjectElement({ foo: 'bar', nested: { a: 2 } });

      assert.isTrue(el1.equals(el2));
      assert.isFalse(el1.equals(el3));
    });
  });

  describe('convenience methods', function () {
    const meta = {
      id: 'foobar',
      classes: ['a'],
    };

    context('when the meta is already set', function () {
      const el = new Element(null, meta);

      Object.keys(meta).forEach((key) => {
        specify(`provides a convenience method for ${key}`, function () {
          assert.deepEqual(
            (el as unknown as Record<string, Element>)[key].toValue(),
            (meta as Record<string, unknown>)[key],
          );
        });
      });
    });

    context('when meta is set with getters and setters', function () {
      const el = new Element(null);

      Object.keys(meta).forEach((key) => {
        (el as unknown as Record<string, unknown>)[key] = (meta as Record<string, unknown>)[key];

        specify(`works for getters and setters for ${key}`, function () {
          assert.deepEqual(
            (el as unknown as Record<string, Element>)[key].toValue(),
            (meta as Record<string, unknown>)[key],
          );
        });

        specify(`stores the correct data in meta for ${key}`, function () {
          assert.deepEqual(el.meta.get(key)!.toValue(), (meta as Record<string, unknown>)[key]);
        });
      });
    });
  });

  describe('removing meta properties', function () {
    const namespace = new Namespace();
    const el = namespace.fromRefract({
      element: 'string',
      meta: {
        id: {
          element: 'string',
          content: 'foobar',
        },
        classes: {
          element: 'array',
          content: [
            {
              element: 'string',
              content: 'a',
            },
          ],
        },
        title: {
          element: 'string',
          content: 'A Title',
        },
        description: {
          element: 'string',
          content: 'A Description',
        },
      },
    });

    specify('should allow removing property', function () {
      el.meta.remove('title');
      assert.deepEqual(el.meta.keys(), ['id', 'classes', 'description']);
    });
  });

  describe('removing attribute properties', function () {
    const namespace = new Namespace();
    const el = namespace.fromRefract({
      element: 'string',
      attributes: {
        href: {
          element: 'string',
          content: 'foobar',
        },
        relation: {
          element: 'string',
          content: 'create',
        },
      },
    });

    specify('should allow removing property', function () {
      el.attributes.remove('href');
      assert.deepEqual(el.attributes.keys(), ['relation']);
    });
  });

  describe('hyperlinking', function () {
    context('when converting from Refract with links', function () {
      specify('correctly loads the links', function () {
        const namespace = new Namespace();
        const el = namespace.fromRefract({
          element: 'string',
          meta: {
            links: {
              element: 'array',
              content: [
                {
                  element: 'link',
                  attributes: {
                    relation: {
                      element: 'string',
                      content: 'foo',
                    },
                    href: {
                      element: 'string',
                      content: '/bar',
                    },
                  },
                },
              ],
            },
          },
          content: 'foobar',
        });

        const link = (el.meta.get('links') as ArrayElement)!.first as LinkElement;
        assert.strictEqual(link.element, 'link');
        assert.strictEqual(link.relation!.toValue(), 'foo');
        assert.strictEqual(link.href!.toValue(), '/bar');
      });
    });

    describe('#links', function () {
      context('when `links` is empty', function () {
        specify('returns an empty array', function () {
          const namespace = new Namespace();
          // String with no links
          const el = namespace.fromRefract({
            element: 'string',
            content: 'foobar',
          });

          assert.lengthOf(el.links as unknown as ArrayElement, 0);
          assert.deepEqual(el.links.toValue(), []);
        });
      });

      context('when there are existing `links`', function () {
        context('refract', function () {
          specify('provides the links from meta', function () {
            const namespace = new Namespace();
            const el = namespace.fromRefract({
              element: 'string',
              meta: {
                links: {
                  element: 'array',
                  content: [
                    {
                      element: 'link',
                      attributes: {
                        relation: {
                          element: 'string',
                          content: 'foo',
                        },
                        href: {
                          element: 'string',
                          content: '/bar',
                        },
                      },
                    },
                  ],
                },
              },
              content: 'foobar',
            });

            const link = (el.links as ArrayElement).first as LinkElement;
            assert.lengthOf(el.links as unknown as ArrayElement, 1);
            assert.strictEqual(link.relation!.toValue(), 'foo');
            assert.strictEqual(link.href!.toValue(), '/bar');
          });
        });
      });
    });

    specify('allows setting links', function () {
      const element = new Element();
      element.links = new ArrayElement([new LinkElement('el')]);

      assert.instanceOf(element.links, ArrayElement);
      assert.strictEqual(element.links.length, 1);
    });
  });

  describe('#children', function () {
    specify('returns empty element slice when content is primitive', function () {
      const element = new Element('value');
      const { children } = element;

      assert.isArray(children);
      assert.strictEqual(children.length, 0);
    });

    specify('returns a direct child', function () {
      const child = new Element('value');
      const element = new Element(child);
      const { children } = element;

      assert.isArray(children);
      assert.strictEqual(children.length, 1);
      assert.strictEqual(children[0], child);
    });

    specify('returns element slice of direct children', function () {
      const child1 = new Element('value1');
      const child2 = new Element('value2');

      const element = new Element([child1, child2]);
      const { children } = element;

      assert.isArray(children);
      assert.strictEqual(children.length, 2);
      assert.strictEqual(children[0], child1);
      assert.strictEqual(children[1], child2);
    });

    specify('returns element slice of key pair item', function () {
      const key = new Element('key');
      const element = new Element(new KeyValuePair(key));

      const { children } = element;

      assert.isArray(children);
      assert.strictEqual(children.length, 1);
      assert.strictEqual(children[0], key);
    });

    specify('returns element slice of key value pair items', function () {
      const key = new Element('key');
      const value = new Element('value');
      const element = new Element(new KeyValuePair(key, value));

      const { children } = element;

      assert.isArray(children);
      assert.strictEqual(children.length, 2);
      assert.strictEqual(children[0], key);
      assert.strictEqual(children[1], value);
    });
  });

  describe('#toValue', function () {
    specify('returns raw value', function () {
      const element = new Element(1);

      assert.strictEqual(element.toValue(), 1);
    });

    specify('returns element value', function () {
      const element = new Element(new Element('Hello'));

      assert.strictEqual(element.toValue(), 'Hello');
    });

    specify('returns array of element value', function () {
      const element = new Element([new Element('Hello')]);

      assert.deepEqual(element.toValue(), ['Hello']);
    });

    specify('returns KeyValuePair value', function () {
      const element = new Element(new KeyValuePair(new Element('name'), new Element('doe')));

      assert.deepEqual(element.toValue(), {
        key: 'name',
        value: 'doe',
      });
    });

    specify('returns KeyValuePair without value', function () {
      const element = new Element(new KeyValuePair(new Element('name')));

      const value = element.toValue() as { key: string; value: unknown };
      assert.strictEqual(value.key, 'name');
      assert.isUndefined(value.value);
    });

    specify('returns KeyValuePair with empty value', function () {
      const element = new Element(new KeyValuePair(new Element('name'), new Element()));

      const value = element.toValue() as { key: string; value: unknown };
      assert.strictEqual(value.key, 'name');
      assert.isUndefined(value.value);
    });
  });

  describe('freezing an element', function () {
    specify('is frozen after being frozen', function () {
      const element = new Element('hello');
      element.freeze();

      assert.isTrue(element.isFrozen);
    });

    specify('freezes children when freezing', function () {
      const element = new Element([new StringElement('hello')]);
      element.freeze();

      assert.isTrue((element.content as Element[])[0].isFrozen);
    });

    specify('sets the parent of any children', function () {
      const element = new Element([new StringElement('hello')]);
      element.freeze();

      assert.strictEqual((element.content as Element[])[0].parent, element);
    });

    specify('sets the parent of meta elements', function () {
      const element = new Element();
      element.meta.set('title', 'Example');
      element.freeze();

      assert.strictEqual(element.meta.parent, element);
      assert.strictEqual((element.meta.content as Element[])[0].parent, element.meta);
    });

    specify("doesn't allow modification of content array once frozen", function () {
      const element = new Element([new StringElement('hello')]);
      element.freeze();

      assert.throws(() => {
        (element.content as Element[]).push(new StringElement('hello'));
      });
    });

    specify("doesn't allow modification of meta once frozen", function () {
      const element = new Element();
      element.freeze();

      assert.throws(() => {
        element.id = 'Hello';
      });
    });

    specify("doesn't allow modification of attributes once frozen", function () {
      const element = new Element();
      element.freeze();

      assert.throws(() => {
        element.attributes.set('key', 'value');
      });
    });

    context('returns frozen objects from lazy accessors', function () {
      // An elements meta and attributes are lazy loaded and created on access.
      // This would cause problems because that means you cannot access
      // meta/attributes on frozen elements because the accessor has
      // side-effects of creation.

      const element = new Element();
      element.freeze();

      specify('meta', function () {
        assert.isTrue(element.meta.isFrozen);
      });

      specify('attributes', function () {
        assert.isTrue(element.attributes.isFrozen);
      });

      specify('getMetaProperty', function () {
        assert.isTrue(
          (
            element as unknown as {
              getMetaProperty: (name: string, defaultValue: unknown) => Element;
            }
          ).getMetaProperty('title', '').isFrozen,
        );
      });
    });

    specify('allows calling freeze on frozen element as no-op', function () {
      // We must actually set values on meta/attributes for this test to work
      // We are protecting against trying to set parent on children elements
      const element = new Element(new Element(true));
      element.meta.set('title', 'Hello World');
      element.attributes.set('version', 1.0);

      element.freeze();
      element.freeze();

      assert.isTrue(Object.isFrozen(element));
    });
  });

  describe('#toRef', function () {
    specify('can create ref element for an element', function () {
      const element = new Element();
      element.id = 'example';

      const ref = element.toRef();

      assert.instanceOf(ref, RefElement);
      assert.strictEqual(ref.path!.toValue(), 'element');
      assert.strictEqual(ref.content, 'example');
    });

    specify('can create a ref element with a path', function () {
      const element = new Element();
      element.id = 'example';

      const ref = element.toRef('attributes');

      assert.instanceOf(ref, RefElement);
      assert.strictEqual(ref.path!.toValue(), 'attributes');
      assert.strictEqual(ref.content, 'example');
    });

    specify('throws error when creating ref element from element without ID', function () {
      const element = new Element();

      assert.throws(() => {
        element.toRef();
      });
    });
  });
});
