import { assert } from 'chai';
import {
  ArrayElement,
  Element,
  ObjectElement,
  RefElement,
  StringElement,
  isPrimitiveElement,
} from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

import { toGeneric, toValue } from '../../src/index.ts';

class ParameterElement extends ObjectElement {
  constructor(...args: ConstructorParameters<typeof ObjectElement>) {
    super(...args);
    this.element = 'parameter';
  }
}

class ParametersElement extends ArrayElement {
  constructor(...args: ConstructorParameters<typeof ArrayElement>) {
    super(...args);
    this.element = 'parameters';
  }
}

describe('toGeneric', function () {
  specify(
    'should transform semantic elements and their descendants to primitive elements',
    function () {
      const element = new ParametersElement([new ParameterElement({ name: 'p', in: 'query' })]);

      const generic = toGeneric(element);
      const elements: string[] = [];
      traverse(generic, {
        enter(path: Path<Element>) {
          elements.push(path.node.element);
          assert.isTrue(isPrimitiveElement(path.node));
        },
      });

      assert.deepEqual(toValue(generic), [{ name: 'p', in: 'query' }]);
      assert.deepEqual(elements, [
        'array',
        'object',
        'member',
        'string',
        'string',
        'member',
        'string',
        'string',
      ]);
    },
  );

  specify('should not modify the element', function () {
    const element = new ParameterElement({ name: 'p' });

    const generic = toGeneric(element);

    assert.strictEqual(element.element, 'parameter');
    assert.notStrictEqual(generic, element);
    assert.notStrictEqual((generic as ObjectElement).get('name'), element.get('name'));
  });

  specify('should keep meta, attributes and source maps', function () {
    const name = new StringElement('p');
    name.startLine = 1;
    name.startCharacter = 2;
    name.startOffset = 3;
    name.endLine = 1;
    name.endCharacter = 5;
    name.endOffset = 6;
    const element = new ParameterElement({ name });
    element.meta.set('ref-origin', '/root.json');
    element.attributes.set('flag', true);

    const generic = toGeneric<ObjectElement>(element);
    const genericName = generic.get('name') as StringElement;

    assert.strictEqual(toValue(generic.meta.get('ref-origin')), '/root.json');
    assert.isTrue(toValue(generic.attributes.get('flag')) as boolean);
    assert.deepEqual(
      [genericName.startLine, genericName.startCharacter, genericName.startOffset],
      [1, 2, 3],
    );
    assert.deepEqual(
      [genericName.endLine, genericName.endCharacter, genericName.endOffset],
      [1, 5, 6],
    );
  });

  specify('should keep shared structures shared', function () {
    const shared = new ParameterElement({ name: 'p' });
    const element = new ArrayElement([shared, shared]);

    const generic = toGeneric<ArrayElement>(element);

    assert.strictEqual(generic.get(0), generic.get(1));
  });

  specify('should keep cyclic structures cyclic', function () {
    const element = new ParameterElement({ name: 'p' });
    element.set('self', element);

    const generic = toGeneric<ObjectElement>(element);

    assert.strictEqual(generic.get('self'), generic);
  });

  specify('should copy elements without a generic counterpart', function () {
    const ref = new RefElement('/path');
    const element = new ArrayElement([ref]);

    const generic = toGeneric<ArrayElement>(element);

    assert.notStrictEqual(generic.get(0), ref);
    assert.strictEqual(generic.get(0)!.element, 'ref');
  });
});
