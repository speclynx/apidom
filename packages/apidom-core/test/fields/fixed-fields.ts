import { assert } from 'chai';
import { Element, ObjectElement } from '@speclynx/apidom-datamodel';

import { fixedFields } from '../../src/index.ts';

describe('fixedFields', function () {
  context('given Element class without fixedFields', function () {
    specify('should return empty array', function () {
      const result = fixedFields(Element);

      assert.deepEqual(result, []);
    });
  });

  context('given Element instance without fixedFields', function () {
    specify('should return empty array', function () {
      const element = new Element('test');
      const result = fixedFields(element);

      assert.deepEqual(result, []);
    });
  });

  context('given Element class with fixedFields', function () {
    class TestElement extends ObjectElement {
      static fixedFields = [
        { name: 'title' },
        { name: 'description', required: true },
        { name: 'version' },
      ];
    }

    specify('should return fixedFields array', function () {
      const result = fixedFields(TestElement);

      assert.isArray(result);
      assert.lengthOf(result, 3);
      assert.deepEqual(result, [
        { name: 'title' },
        { name: 'description', required: true },
        { name: 'version' },
      ]);
    });

    context('given indexed option', function () {
      specify('should return indexed object', function () {
        const result = fixedFields(TestElement, { indexed: true });

        assert.isObject(result);
        assert.hasAllKeys(result, ['title', 'description', 'version']);
        assert.deepEqual(result, {
          title: { name: 'title' },
          description: { name: 'description', required: true },
          version: { name: 'version' },
        });
      });

      specify('should allow O(1) lookups', function () {
        const result = fixedFields(TestElement, { indexed: true });

        assert.isTrue(Object.hasOwn(result, 'description'));
        assert.isFalse(Object.hasOwn(result, 'nonexistent'));
      });
    });
  });

  context('given Element instance with fixedFields', function () {
    class TestElement extends ObjectElement {
      static fixedFields = [{ name: 'name' }, { name: 'url' }];
    }

    specify('should return fixedFields array from instance', function () {
      const element = new TestElement({ name: 'test', url: 'http://example.com' });
      const result = fixedFields(element);

      assert.isArray(result);
      assert.lengthOf(result, 2);
      assert.deepEqual(result, [{ name: 'name' }, { name: 'url' }]);
    });

    context('given indexed option', function () {
      specify('should return indexed object from instance', function () {
        const element = new TestElement({ name: 'test', url: 'http://example.com' });
        const result = fixedFields(element, { indexed: true });

        assert.isObject(result);
        assert.hasAllKeys(result, ['name', 'url']);
      });
    });
  });

  context('given inherited fixedFields', function () {
    class ParentElement extends ObjectElement {
      static fixedFields = [{ name: 'parentField' }];
    }

    class ChildElement extends ParentElement {
      static fixedFields = [...ParentElement.fixedFields, { name: 'childField' }];
    }

    specify('should return combined fixedFields', function () {
      const result = fixedFields(ChildElement);

      assert.lengthOf(result, 2);
      assert.deepEqual(result, [{ name: 'parentField' }, { name: 'childField' }]);
    });
  });
});
