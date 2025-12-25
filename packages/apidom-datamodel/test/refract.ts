import { assert } from 'chai';

import {
  refract,
  StringElement,
  NumberElement,
  BooleanElement,
  NullElement,
  ArrayElement,
  ObjectElement,
  MemberElement,
} from '../src/index.ts';

describe('refract', function () {
  specify('returns any given element without refracting', function () {
    const element = new StringElement('hello');
    const refracted = refract(element);

    assert.strictEqual(refracted, element);
  });

  specify('can refract a string into a string element', function () {
    const element = refract('Hello');

    assert.instanceOf(element, StringElement);
    assert.strictEqual(element.content, 'Hello');
  });

  specify('can refract a number into a number element', function () {
    const element = refract(1);

    assert.instanceOf(element, NumberElement);
    assert.strictEqual(element.content, 1);
  });

  specify('can refract a boolean into a boolean element', function () {
    const element = refract(true);

    assert.instanceOf(element, BooleanElement);
    assert.strictEqual(element.content, true);
  });

  specify('can refract a null value into a null element', function () {
    const element = refract(null);

    assert.instanceOf(element, NullElement);
    assert.strictEqual(element.content, null);
  });

  specify('can refract an array of values into an array element', function () {
    const element = refract(['Hi', 1]);

    assert.instanceOf(element, ArrayElement);
    assert.strictEqual(element.length, 2);
    assert.instanceOf(element.get(0), StringElement);
    assert.strictEqual(element.get(0)!.content, 'Hi');
    assert.instanceOf(element.get(1), NumberElement);
    assert.strictEqual(element.get(1)!.content, 1);
  });

  specify('can refract an object into an object element', function () {
    const element = refract({ name: 'Doe' });

    assert.instanceOf(element, ObjectElement);
    assert.strictEqual(element.length, 1);

    const member = (element.content as MemberElement[])[0];
    assert.instanceOf(member, MemberElement);
    assert.instanceOf(member.key, StringElement);
    assert.strictEqual(member.key.content, 'name');
    assert.instanceOf(member.value, StringElement);
    assert.strictEqual(member.value.content, 'Doe');
  });
});
