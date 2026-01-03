import { assert } from 'chai';
import {
  Element,
  ObjectElement,
  StringElement,
  NumberElement,
  ArrayElement,
  MemberElement,
} from '@speclynx/apidom-datamodel';

import {
  getNodeType,
  getNodePrimitiveType,
  isNode,
  cloneNode,
  mutateNode,
  getVisitFn,
} from '../src/index.ts';

describe('visitors', function () {
  context('getNodeType', function () {
    context('given StringElement', function () {
      specify('should return "StringElement"', function () {
        const element = new StringElement('hello');
        assert.strictEqual(getNodeType(element), 'StringElement');
      });
    });

    context('given NumberElement', function () {
      specify('should return "NumberElement"', function () {
        const element = new NumberElement(42);
        assert.strictEqual(getNodeType(element), 'NumberElement');
      });
    });

    context('given ObjectElement', function () {
      specify('should return "ObjectElement"', function () {
        const element = new ObjectElement({ key: 'value' });
        assert.strictEqual(getNodeType(element), 'ObjectElement');
      });
    });

    context('given ArrayElement', function () {
      specify('should return "ArrayElement"', function () {
        const element = new ArrayElement([1, 2, 3]);
        assert.strictEqual(getNodeType(element), 'ArrayElement');
      });
    });

    context('given MemberElement', function () {
      specify('should return "MemberElement"', function () {
        const element = new MemberElement('key', 'value');
        assert.strictEqual(getNodeType(element), 'MemberElement');
      });
    });

    context('given element with undefined type', function () {
      specify('should return "Element"', function () {
        const element = { element: undefined };
        assert.strictEqual(getNodeType(element), 'Element');
      });
    });

    context('given element with "element" type', function () {
      specify('should return "Element"', function () {
        const element = { element: 'element' };
        assert.strictEqual(getNodeType(element), 'Element');
      });
    });
  });

  context('getNodePrimitiveType', function () {
    context('given StringElement', function () {
      specify('should return "StringElement"', function () {
        const element = new StringElement('hello');
        assert.strictEqual(getNodePrimitiveType(element), 'StringElement');
      });
    });

    context('given NumberElement', function () {
      specify('should return "NumberElement"', function () {
        const element = new NumberElement(42);
        assert.strictEqual(getNodePrimitiveType(element), 'NumberElement');
      });
    });

    context('given ObjectElement', function () {
      specify('should return "ObjectElement"', function () {
        const element = new ObjectElement({ key: 'value' });
        assert.strictEqual(getNodePrimitiveType(element), 'ObjectElement');
      });
    });

    context('given ArrayElement', function () {
      specify('should return "ArrayElement"', function () {
        const element = new ArrayElement([1, 2, 3]);
        assert.strictEqual(getNodePrimitiveType(element), 'ArrayElement');
      });
    });

    context('given custom element extending ObjectElement', function () {
      specify('should return "ObjectElement" (primitive type)', function () {
        class ContactElement extends ObjectElement {
          constructor() {
            super();
            this.element = 'contact';
          }
        }
        const element = new ContactElement();
        // ContactElement has element='contact', but primitive() returns 'object'
        assert.strictEqual(getNodePrimitiveType(element), 'ObjectElement');
      });
    });
  });

  context('isNode', function () {
    context('given an Element', function () {
      specify('should return true', function () {
        const element = new StringElement('hello');
        assert.isTrue(isNode(element));
      });
    });

    context('given a non-Element value', function () {
      specify('should return false for primitives', function () {
        assert.isFalse(isNode('string'));
        assert.isFalse(isNode(42));
        assert.isFalse(isNode(null));
        assert.isFalse(isNode(undefined));
      });

      specify('should return false for plain objects', function () {
        assert.isFalse(isNode({}));
        assert.isFalse(isNode([]));
      });
    });
  });

  context('cloneNode', function () {
    context('given an ObjectElement', function () {
      specify('should return a shallow clone', function () {
        const element = new ObjectElement({ key: 'value' });
        const cloned = cloneNode(element);

        assert.notStrictEqual(cloned, element);
        assert.strictEqual(cloned.element, element.element);
      });
    });
  });

  context('mutateNode', function () {
    context('given MemberElement parent', function () {
      specify('should set the value property', function () {
        const member = new MemberElement('key', 'oldValue');
        const newValue = new StringElement('newValue');

        mutateNode<Element>(member, 'value', newValue);
        assert.strictEqual(member.value, newValue);
      });
    });

    context('given array parent', function () {
      specify('should set the element at index', function () {
        const arr: Element[] = [new StringElement('a'), new StringElement('b')];
        const newValue = new StringElement('c');

        // mutateNode handles arrays specially at runtime
        mutateNode(arr as unknown as Element, 0, newValue);
        assert.strictEqual(arr[0], newValue);
      });

      specify('should set undefined when value is null', function () {
        const arr: (Element | undefined)[] = [new StringElement('a'), new StringElement('b')];

        // mutateNode handles arrays specially at runtime
        mutateNode(arr as unknown as Element, 0, null);
        assert.isUndefined(arr[0]);
      });
    });

    context('given object parent', function () {
      specify('should set the property', function () {
        const obj: Record<string, unknown> = { key: 'oldValue' };
        const newValue = new StringElement('newValue');

        // mutateNode handles plain objects at runtime
        mutateNode(obj as unknown as Element, 'key', newValue);
        assert.strictEqual(obj.key, newValue);
      });

      specify('should delete property when value is null', function () {
        const obj: Record<string, unknown> = { key: 'value' };

        // mutateNode handles plain objects at runtime
        mutateNode(obj as unknown as Element, 'key', null);
        assert.notProperty(obj, 'key');
      });
    });
  });

  context('getVisitFn', function () {
    context('Pattern 1: { Type() {} } - shorthand for enter only', function () {
      specify('should return function for enter phase', function () {
        const fn = () => {};
        const visitor = { StringElement: fn };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', false), fn);
      });

      specify('should return null for leave phase', function () {
        const fn = () => {};
        const visitor = { StringElement: fn };

        assert.isNull(getVisitFn(visitor, 'StringElement', true));
      });
    });

    context('Pattern 2: { Type: { enter, leave } }', function () {
      specify('should return enter function for enter phase', function () {
        const enterFn = () => {};
        const leaveFn = () => {};
        const visitor = { StringElement: { enter: enterFn, leave: leaveFn } };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', false), enterFn);
      });

      specify('should return leave function for leave phase', function () {
        const enterFn = () => {};
        const leaveFn = () => {};
        const visitor = { StringElement: { enter: enterFn, leave: leaveFn } };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', true), leaveFn);
      });
    });

    context('Pattern 3: { enter() {}, leave() {} }', function () {
      specify('should return generic enter function', function () {
        const enterFn = () => {};
        const visitor = { enter: enterFn };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', false), enterFn);
      });

      specify('should return generic leave function', function () {
        const leaveFn = () => {};
        const visitor = { leave: leaveFn };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', true), leaveFn);
      });
    });

    context('Pattern 4: { enter: { Type() {} } }', function () {
      specify('should return type-specific function in enter', function () {
        const fn = () => {};
        // Pattern 4 uses { enter: { Type: fn } } format
        const visitor = { enter: { StringElement: fn } };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', false), fn);
      });

      specify('should return type-specific function in leave', function () {
        const fn = () => {};
        // Pattern 4 uses { leave: { Type: fn } } format
        const visitor = { leave: { StringElement: fn } };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', true), fn);
      });
    });

    context('pipe-separated keys', function () {
      specify('should match first type in pipe-separated key', function () {
        const fn = () => {};
        const visitor = { 'StringElement|NumberElement': fn };

        assert.strictEqual(getVisitFn(visitor, 'StringElement', false), fn);
      });

      specify('should match second type in pipe-separated key', function () {
        const fn = () => {};
        const visitor = { 'StringElement|NumberElement': fn };

        assert.strictEqual(getVisitFn(visitor, 'NumberElement', false), fn);
      });

      specify('should not match partial type names', function () {
        const fn = () => {};
        const visitor = { 'StringElement|NumberElement': fn };

        assert.isNull(getVisitFn(visitor, 'String', false));
      });
    });

    context('given undefined type', function () {
      specify('should return null', function () {
        const visitor = { StringElement: () => {} };

        assert.isNull(getVisitFn(visitor, undefined, false));
      });
    });

    context('given no matching visitor', function () {
      specify('should return null', function () {
        const visitor = { StringElement: () => {} };

        assert.isNull(getVisitFn(visitor, 'NumberElement', false));
      });
    });
  });
});
