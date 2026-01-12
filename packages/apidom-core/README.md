# @speclynx/apidom-core

`apidom-core` is a package that contains tools for manipulating the ApiDOM structures.
It provides utilities for transformation, merging, cloning, and refraction of ApiDOM elements.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-core
```

---

## Relationship with other packages

This package works together with:

- **@speclynx/apidom-datamodel** - Contains the core element primitives (`ObjectElement`, `ArrayElement`, `StringElement`, etc.), predicates, and the `Namespace` class
- **@speclynx/apidom-traverse** - Contains traversal utilities (`traverse`, `filter`, `find`, `forEach`, etc.)
- **@speclynx/apidom-core** - Contains utilities for working with elements: transformers, merging, cloning, and refractor plugins

```js
// Elements and predicates come from datamodel
import { ObjectElement, StringElement, isObjectElement } from '@speclynx/apidom-datamodel';

// Traversal utilities come from traverse
import { traverse, filter, find } from '@speclynx/apidom-traverse';

// Other utilities come from core
import { toValue, deepmerge, from } from '@speclynx/apidom-core';

const obj = new ObjectElement({ a: 'b' });
toValue(obj); // => { a: 'b' }
```

---

## Transcluder

Transclusion is the inclusion of one ApiDOM fragment into another ApiDOM fragment.
Our [transcluder](https://github.com/speclynx/apidom/tree/main/packages/apidom-core/src/transcluder) does exactly that and is based on mutating algorithm.

```js
import { ArrayElement, NumberElement } from '@speclynx/apidom-datamodel';
import { transclude } from '@speclynx/apidom-core';

const element = new ArrayElement([1, 2, 3]);
const search = element.get(1);
const replace = new NumberElement(4);

transclude(search, replace, element); // => ArrayElement<[1, 4, 3]>
```

When multiple transclusions are going to be performed use [Transcluder stamp](https://github.com/speclynx/apidom/blob/main/packages/apidom-core/src/transcluder/Transcluder.ts)
for optimal performance.

```js
import { ArrayElement, NumberElement } from '@speclynx/apidom-datamodel';
import { Transcluder } from '@speclynx/apidom-core';

const element = new ArrayElement([1, 2, 3]);
const search = element.get(1);
const replace = new NumberElement(4);
const transcluder = Transcluder({ element });

transcluder.transclude(search, replace); // => ArrayElement<[1, 4, 3]>
```

---

## Shallow merging

`mergeRight` and `mergeLeft` functions merge members of two or more ObjectElements shallowly
and handles shallow merging of ArrayElements as well.

### API

#### mergeRight(target, source, [options])

Merges two ApiDOM elements target and source shallowly, returning a new merged ApiDOM element with the elements
from both target and source. If an element at the same key is present for both target and source,
the value from source will appear in the result. Merging creates a new ApiDOM element,
so that neither target nor source is modified (operation is immutable).

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { mergeRight } from '@speclynx/apidom-core';

const x = new ObjectElement({
  foo: { bar: 3 },
});

const y = new ObjectElement({
  foo: { baz: 4 },
  quux: 5,
});

const output = mergeRight(x, y);
// =>
// ObjectElement({
//   foo: ObjectElement({
//     baz: 4,
//   }),
//   quux: 5,
// })
```

#### mergeRight.all([element1, element2, ...], [options])

Merges shallowly any number of ApiDOM elements into a single ApiDOM element.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { mergeRight } from '@speclynx/apidom-core';

const foobar = new ObjectElement({ foo: { bar: 3 } });
const foobaz = new ObjectElement({ foo: { baz: 4 } });
const bar = new ObjectElement({ bar: 'yay!' });

const output = mergeRight.all([ foobar, foobaz, bar ]);
// => ObjectElement({ foo: { baz: 4 }, bar: 'yay!' })
```

#### mergeLeft(source, target, [options])

Merges two ApiDOM elements source and target shallowly, returning a new merged ApiDOM element with the elements
from both target and source. If an element at the same key is present for both target and source,
the value from source will appear in the result. Merging creates a new ApiDOM element,
so that neither target nor source is modified (operation is immutable).

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { mergeLeft } from '@speclynx/apidom-core';

const x = new ObjectElement({
  foo: { bar: 3 },
});

const y = new ObjectElement({
  foo: { baz: 4 },
  quux: 5,
});

const output = mergeLeft(x, y);
// =>
// ObjectElement({
//   foo: ObjectElement({
//     bar: 3,
//   }),
//   quux: 5,
// })
```

#### mergeLeft.all([element1, element2, ...], [options])

Merges shallowly any number of ApiDOM elements into a single ApiDOM element.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { mergeLeft } from '@speclynx/apidom-core';

const foobar = new ObjectElement({ foo: { bar: 3 } });
const foobaz = new ObjectElement({ foo: { baz: 4 } });
const bar = new ObjectElement({ bar: 'yay!' });

const output = mergeLeft.all([ foobar, foobaz, bar ]);
// => ObjectElement({ foo: { baz: 3 }, bar: 'yay!' })
```

### Shallow merge Options

`mergeRight` and `mergeLeft` take the same options as [deepmerge](#deepmerge-options), except for `customMerge` and `clone`.

## Deep merging

`deepmerge` functions merged members of two or more ObjectElements deeply
and handles deep merging of ArrayElements as well. This deep merge implementation
is a functional equivalent of [deepmerge](https://www.npmjs.com/package/deepmerge)
that works equivalently on ApiDOM structures.

### API

#### deepmerge(target, source, [options])

Merges two ApiDOM elements target and source deeply, returning a new merged ApiDOM element with the elements
from both target and source. If an element at the same key is present for both target and source,
the value from source will appear in the result. Merging creates a new ApiDOM element,
so that neither target nor source is modified (operation is immutable).

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const x = new ObjectElement({
  foo: { bar: 3 },
  array: [
    {
      does: 'work',
      too: [1, 2, 3],
    },
  ],
});

const y = new ObjectElement({
  foo: { baz: 4 },
  quux: 5,
  array: [
    {
      does: 'work',
      too: [4, 5, 6],
    },
    {
      really: 'yes',
    },
  ],
});

const output = deepmerge(x, y);
// =>
// ObjectElement({
//   foo: ObjectElement({
//     bar: 3,
//     baz: 4,
//   }),
//   array: ArrayElement([
//     ObjectElement({
//       does: 'work',
//       too: [1, 2, 3],
//     }),
//     ObjectElement({
//       does: 'work',
//       too: [4, 5, 6],
//     }),
//     ObjectElement({
//       really: 'yes',
//     }),
//   ]),
//   quux: 5,
// })
```

#### deepmerge.all([element1, element2, ...], [options])

Merges deeply any number of ApiDOM elements into a single ApiDOM element.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const foobar = new ObjectElement({ foo: { bar: 3 } });
const foobaz = new ObjectElement({ foo: { baz: 4 } });
const bar = new ObjectElement({ bar: 'yay!' });

const output = deepmerge.all([ foobar, foobaz, bar ]);
// => ObjectElement({ foo: { bar: 3, baz: 4 }, bar: 'yay!' })
```

### Deepmerge Options

#### arrayElementMerge

There are multiple ways to merge two ArrayElements, below are a few examples, but you can also create your own custom function.

Your `arrayElementMerge` function will be called with three arguments: a `target` ArrayElement, the `source` ArrayElement,
and an `options` object.

```js
import { ArrayElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const arrayElementMerge = (destination, source, options) => source;

const target = new ArrayElement([1, 2, 3]);
const source = new ArrayElement([3, 2, 1]);
const output = deepmerge(target, source, { arrayElementMerge });
// => ArrayElement([3, 2, 1]);
```

#### objectElementMerge

There are multiple ways to merge two ObjectElements, below are a few examples, but you can also create your own custom function.

Your `objectElementMerge` function will be called with three arguments: a `target` ObjectElement, the `source` ObjectElement,
and an `options` object.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const objectElementMerge = (destination, source, options) => source;

const target = new ObjectElement({a: 1, b: 2});
const source = new ObjectElement({c: 3, d: 4});
const output = deepmerge(target ,source, { objectElementMerge });
// => ObjectElement({c: 3, d: 4});
```

#### isMergeableElement

By default, deepmerge clones every member from ObjectElement and ArrayElement.
You may not want this, if your ObjectElements are of special types,
and you want to copy the whole ObjectElement instead of just copying its member.

You can accomplish this by passing in a function for the `isMergeableElement` option.

```js
import { ObjectElement, Element, isObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

class CustomObjectElement extends ObjectElement {
  constructor(...args) {
    super(...args);
    this.element = 'custom';
  }
}
const instantiatedCustomObjectElement = new CustomObjectElement({ special: 'oh yeah' });

const target = new ObjectElement({
  someProperty: {
    cool: 'oh for sure',
  },
});
const source = new ObjectElement({
  someProperty: instantiatedCustomObjectElement,
});
const isMergeableElement = (element: Element) => isObjectElement(element) && !(element instanceof CustomObjectElement);

const output = deepmerge(target, source, {
  isMergeableElement,
});
// output.get('someProperty').get('cool'); // => undefined
// output.get('someProperty').get('special'); // => 'oh yeah'
// output.get('someProperty') instanceof CustomObjectElement // => true
```

#### customMerge

Specifies a function which can be used to override the default merge behavior for a member, based on the key name.
The `customMerge` function will be passed the key for each member, and should return the function which should
be used to merge the values for that member.
It may also return undefined, in which case the default merge behaviour will be used.

```js
import { ObjectElement, StringElement, Element } from '@speclynx/apidom-datamodel';
import { deepmerge, toValue } from '@speclynx/apidom-core';

const alex = new ObjectElement({
	name: {
		first: 'Alex',
		last: 'Alexson'
	},
	pets: ['Cat', 'Parrot']
});
const tony = new ObjectElement({
	name: {
		first: 'Tony',
		last: 'Tonison'
	},
	pets: ['Dog']
});

const mergeNames = (nameA: ObjectElement, nameB: ObjectElement) =>
  new StringElement(`${toValue(nameA.get('first'))} and ${toValue(nameB.get('first'))}`);
const customMerge = (key: Element) => (toValue(key) === 'name' ? mergeNames : undefined);

const output = deepmerge(alex, tony, { customMerge });
// output.get('name'); // => StringElement('Alex and Tony')
// output.get('pets'); // => ArrayElement(['Cat', 'Parrot', 'Dog'])
```

#### customMetaMerge

Specifies a function which can be used to override the default metadata merge behavior.
The `customMetaMerge` function will be passed target and source metadata. If not specified,
the default behavior is to deep copy metadata from target to new merged element.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const alex = new ObjectElement({ name: { first: 'Alex' } }, { metaKey: true });
const tony = new ObjectElement({ name: { first: 'Tony' } }, { metaKey: false });

const customMetaMerge = (targetMeta, sourceMeta) => deepmerge(targetMeta, sourceMeta);

const output = deepmerge(alex, tony, { customMetaMerge });
// output.meta.get('metaKey') // => BooleanElement(false)
```

#### customAttributesMerge

Specifies a function which can be used to override the default attributes merge behavior.
The `customAttributesMerge` function will be passed target and source attributes. If not specified,
the default behavior is to deep copy attributes from target to new merged element.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { deepmerge } from '@speclynx/apidom-core';

const alex = new ObjectElement({ name: { first: 'Alex' } }, undefined, { attributeKey: true });
const tony = new ObjectElement({ name: { first: 'Tony' } }, undefined, { attributeKey: false });

const customAttributesMerge = (targetMeta, sourceMeta) => deepmerge(targetMeta, sourceMeta);

const output = deepmerge(alex, tony, { customAttributesMerge });
// output.attributes.get('attributeKey') // => BooleanElement(false)
```

#### clone

Defaults to `true`.

If `clone` is false then child elements will be copied directly instead of being cloned.

---

## Refractor plugins

Refractor plugins allow you to transform ApiDOM structures during traversal.
Use `dispatchRefractorPlugins` to apply plugins to an element tree.

```js
import { ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { dispatchRefractorPlugins, from } from '@speclynx/apidom-core';

const object = { a: 'b' };
const objectElement = from(object);

const plugin = ({ predicates, namespace }) => ({
  name: 'plugin',
  pre() {
      console.dir('runs before traversal');
  },
  visitor: {
    ObjectElement(objectElement) {
      objectElement.getMember('a').value = new StringElement('c');
    },
  },
  post() {
      console.dir('runs after traversal');
  },
});

dispatchRefractorPlugins(objectElement, [plugin]); // => ObjectElement({ a = 'c' })
```
You can define as many plugins as needed to enhance the resulting ApiDOM structure.
If multiple plugins with the same visitor method are defined, they run in parallel (just like in Babel).

### Element identity plugin

`apidom-core` package comes with `refractorPluginElementIdentity`. When used, this plugin will
assign unique ID to all elements in ApiDOM tree.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { refractorPluginElementIdentity, dispatchRefractorPlugins, from } from '@speclynx/apidom-core';

const objectElement = from({ a: 'b' });
dispatchRefractorPlugins(objectElement, [refractorPluginElementIdentity()]);

objectElement.id; // 8RaWF9
objectElement.getMember('a').key.id; // NdHHV7
objectElement.getMember('a').value.id; // rFGVFP
```

You can configure the plugin to generate unique IDs in the specific length:

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { refractorPluginElementIdentity, dispatchRefractorPlugins, from } from '@speclynx/apidom-core';

const objectElement = from({ a: 'b' });
dispatchRefractorPlugins(objectElement, [refractorPluginElementIdentity({ length: 36 })]);

objectElement.id; // OnReGGrO7fMd9ztacvGfwGbOdGKuOFLiQQ1W
objectElement.getMember('a').key.id; // BN6rHsmqI56SMQ1elshtbgRVECtEWNYS9lmd
objectElement.getMember('a').value.id; // Ki4tWmf9xw9Lwb8MxkXJq1uONmJrmhXifmsI
```

### Semantic element identity plugin

`apidom-core` package comes with `refractorPluginSemanticElementIdentity`. When used, this plugin will
assign unique ID to all non-primitive elements in ApiDOM tree. Primitive elements include
`ObjectElement`, `ArrayElement`, `StringElement`, `BooleanElement`, `NullElement`, `NumberElement`, and `MemberElement`.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { refractorPluginSemanticElementIdentity, dispatchRefractorPlugins, from } from '@speclynx/apidom-core';

// Create a semantic element (element with non-primitive name)
class InfoElement extends ObjectElement {
  constructor(...args) {
    super(...args);
    this.element = 'info';
  }
}

const infoElement = new InfoElement({ title: 'title' });
const objectElement = from({ a: 'b', info: infoElement });
dispatchRefractorPlugins(objectElement, [refractorPluginSemanticElementIdentity()]);

objectElement.id; // ''
objectElement.getMember('a').key.id; // ''
objectElement.getMember('a').value.id; // ''
objectElement.getMember('info').key.id; // ''
objectElement.getMember('info').value.id; // '8RaWF9'
```

You can configure the plugin to generate unique IDs in the specific length:

```js
import { refractorPluginSemanticElementIdentity, dispatchRefractorPlugins, from } from '@speclynx/apidom-core';

const objectElement = from({ a: 'b', info: infoElement });
dispatchRefractorPlugins(objectElement, [refractorPluginSemanticElementIdentity({ length: 36 })]);

objectElement.getMember('info').value.id; // 'OnReGGrO7fMd9ztacvGfwGbOdGKuOFLiQQ1W'
```

---

## Transformers

Following functions transforms ApiDOM between its various forms. All transformers (except `toValue`) can accept
ApiDOM namespace instance as a second argument.

### from

Transforms data to an Element from a particular namespace.

From a [refracted string](https://github.com/refractproject/refract-spec) form:

```js
import { from } from '@speclynx/apidom-core';

const refractedString = '{"element":"number","content":1}';

from(refractedString); // => NumberElement<1>
```

From a [refracted](https://github.com/refractproject/refract-spec) form:

```js
import { from } from '@speclynx/apidom-core';

const refracted = { element: 'number', content: 1 };

from(refracted); // => NumberElement<1>
```

From a JavaScript form:

```js
import { from } from '@speclynx/apidom-core';

const javascriptForm = 1;

from(javascriptForm); // => NumberElement<1>
```

### toValue

Transforms the ApiDOM into JavaScript POJO. This POJO would be the result of interpreting the ApiDOM
into JavaScript structure. This function can handle cycles in ApiDOM structure.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

const objElement = new ObjectElement({ a: 'b' });

toValue(objElement); // => { a: 'b' }
```

### toJSON

Transforms the ApiDOM into JSON string.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { toJSON } from '@speclynx/apidom-core';

const objElement = new ObjectElement({ a: 'b' });

toJSON(objElement); // => '{"a":"b"}'
```

### toYAML

Transforms the ApiDOM into YAML string.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { toYAML } from '@speclynx/apidom-core';

const objElement = new ObjectElement({ a: 'b' });

toYAML(objElement);
/**
 * %YAML 1.2
 * ---
 *
 * "a": "b"
 */
```

### dehydrate

Creates a [refract representation](https://github.com/refractproject/refract-spec) of an Element.

```js
import { NumberElement } from '@speclynx/apidom-datamodel';
import { dehydrate } from '@speclynx/apidom-core';

const numberElement = new NumberElement(1);

dehydrate(numberElement); // => { element: 'number', content: 1 }
```

### S-Expression

Transforms ApiDOM into [symbolic expression](https://en.wikipedia.org/wiki/S-expression).

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';

const objectElement = new ObjectElement({ a: 1 });

sexprs(objectElement);
// =>
// (ObjectElement
//   (MemberElement
//     (StringElement)
//     (NumberElement)))


```

### toString

Create a [refracted string](https://github.com/refractproject/refract-spec) representation of an Element.

```js
import { NumberElement } from '@speclynx/apidom-datamodel';
import { toString } from '@speclynx/apidom-core';

const numberElement = new NumberElement(1);

toString(numberElement); // => '{"element":"number","content":1}'
```
