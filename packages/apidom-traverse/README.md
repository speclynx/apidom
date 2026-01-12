# @speclynx/apidom-traverse

`@speclynx/apidom-traverse` provides traversal utilities for ApiDOM structures.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-traverse
```

## Usage

### traverse

The core traversal function that walks an ApiDOM tree using visitors.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { traverse } from '@speclynx/apidom-traverse';

const element = new ObjectElement({ a: 'b' });

traverse(element, {
  enter(path) {
    console.log('entering:', path.node.element);
  },
  leave(path) {
    console.log('leaving:', path.node.element);
  },
});
```

### traverseAsync

Async version of traverse that supports async visitors.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { traverseAsync } from '@speclynx/apidom-traverse';

const element = new ObjectElement({ a: 'b' });

await traverseAsync(element, {
  async enter(path) {
    await someAsyncOperation(path.node);
  },
});
```

---

## Operations

Higher-level functions built on top of `traverse` for common use cases.
All operations use **data-first** signatures: the element comes before the predicate/options.

### filter

Finds all elements matching the predicate.

```js
import { ObjectElement, isNumberElement } from '@speclynx/apidom-datamodel';
import { filter } from '@speclynx/apidom-traverse';

const element = new ObjectElement({ a: 'b', c: 2 });

filter(element, isNumberElement); // => [NumberElement<2>]
```

### find

Find first element that satisfies the provided predicate.

```js
import { ObjectElement, isNumberElement } from '@speclynx/apidom-datamodel';
import { find } from '@speclynx/apidom-traverse';

const element = new ObjectElement({ a: 'b', c: 2 });

find(element, isNumberElement); // => NumberElement<2>
```

### findAtOffset

ApiDOM nodes can be associated with source maps. This function finds the most inner node at the given offset.
If includeRightBound is set, also finds nodes that end at the given offset.

```js
import { findAtOffset } from '@speclynx/apidom-traverse';

findAtOffset(elementWithSourceMaps, 3); // => returns most inner node at offset 3
findAtOffset(elementWithSourceMaps, { offset: 3, includeRightBound: true });
```

### reject

Complement of [filter](#filter). Finds all elements NOT matching the predicate.

```js
import { ArrayElement, isNumberElement } from '@speclynx/apidom-datamodel';
import { reject } from '@speclynx/apidom-traverse';

const element = new ArrayElement([1, 'a']);

reject(element, isNumberElement); // => [ArrayElement, StringElement<'a'>]
```

### some

Tests whether at least one element passes the predicate.

```js
import { ArrayElement, isNumberElement } from '@speclynx/apidom-datamodel';
import { some } from '@speclynx/apidom-traverse';

const element = new ArrayElement([1, 'a']);

some(element, isNumberElement); // => true
```

### forEach

Executes the callback on this element and all descendants.

```js
import { ArrayElement } from '@speclynx/apidom-datamodel';
import { forEach } from '@speclynx/apidom-traverse';

const element = new ArrayElement([1, 'a']);

forEach(element, console.dir); // => prints ArrayElement, NumberElement, StringElement in this order
```

The execution of the callback can be controlled further by providing a predicate.

```js
import { ArrayElement, isNumberElement } from '@speclynx/apidom-datamodel';
import { forEach } from '@speclynx/apidom-traverse';

const element = new ArrayElement([1, 'a']);

forEach(element, { callback: console.dir, predicate: isNumberElement }); // => prints NumberElement<1>
```

### parents

Computes upwards edges from every child to its parent.

#### ObjectElement example

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { parents } from '@speclynx/apidom-traverse';

const element = new ObjectElement({ key: 'value' });
const memberElement = element.getMember('key');
const { key: keyElement, value: valueElement } = memberElement;

const parentEdges = parents(element); // => WeakMap<ChildElement, ParentElement>

parentEdges.get(memberElement) === element; // => true
parentEdges.get(keyElement) === memberElement; // => true
parentEdges.get(valueElement) === memberElement; // => true
```

#### ArrayElement example

```js
import { ArrayElement, StringElement } from '@speclynx/apidom-datamodel';
import { parents } from '@speclynx/apidom-traverse';

const itemElement1 = new StringElement('item1');
const itemElement2 = new StringElement('item2');
const element = new ArrayElement([itemElement1, itemElement2]);

const parentEdges = parents(element); // => WeakMap<ChildElement, ParentElement>

parentEdges.get(itemElement1) === element; // => true
parentEdges.get(itemElement2) === element; // => true
```

---

## Path

The `Path` object is passed to visitor functions and provides context about the current node.

### Properties

- `node` - The current element being visited
- `parent` - The parent container (array or element)
- `parentPath` - The Path of the parent element
- `key` - The key or index in the parent
- `index` - Numeric index if inside an array (undefined otherwise)
- `inList` - Whether the node is inside an array

### Methods

- `skip()` - Skip visiting children of this node
- `stop()` - Stop all traversal
- `replaceWith(node)` - Replace the current node
- `remove()` - Remove the current node (in mutable mode)
- `isRoot()` - Check if this is the root node
- `getAncestry()` - Get all ancestor paths
- `getAncestorNodes()` - Get all ancestor nodes
- `getPathKeys()` - Get the path from root to current node
- `findParent(predicate)` - Find first parent matching predicate
- `find(predicate)` - Find self or parent matching predicate

---

## Visitor Utilities

### getNodeType

Returns the element type name for use in visitors.

```js
import { StringElement } from '@speclynx/apidom-datamodel';
import { getNodeType } from '@speclynx/apidom-traverse';

getNodeType(new StringElement('hello')); // => 'StringElement'
```

### mergeVisitors

Merges multiple visitors into a single visitor.

```js
import { mergeVisitors } from '@speclynx/apidom-traverse';

const visitor1 = { StringElement(path) { /* ... */ } };
const visitor2 = { NumberElement(path) { /* ... */ } };

const merged = mergeVisitors([visitor1, visitor2]);
```
