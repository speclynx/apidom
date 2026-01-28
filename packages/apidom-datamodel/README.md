# @speclynx/apidom-datamodel

`@speclynx/apidom-datamodel` provides the foundational data model primitives for ApiDOM.
It contains the core element classes, namespace system, and serialization utilities
that form the basis for all ApiDOM structures.

The data model is based on SpecLynx-flavored [Refract specification 0.7.0](https://github.com/refractproject/refract-spec),
a recursive data structure for expressing complex structures, relationships, and metadata.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-datamodel
```

---

## Primitive Elements

Primitive elements are the building blocks of ApiDOM. Each element has:
- `element` - Type identifier (e.g., 'string', 'object', 'array')
- `content` - The element's value
- `meta` - Metadata (id, classes, title, description, links)
- `attributes` - Element-specific properties

### Element

Base class that all ApiDOM elements extend.

```js
import { Element } from '@speclynx/apidom-datamodel';

const element = new Element('content');
element.element = 'custom';
element.meta.set('id', 'unique-id');
element.attributes.set('attr', 'value');
```

Additionally, convenience attributes are exposed on every element as shortcuts for common meta properties:

- `id` (StringElement) - Shortcut for `.meta.get('id')`
- `classes` (ArrayElement) - Shortcut for `.meta.get('classes')`
- `links` (ArrayElement) - Shortcut for `.meta.get('links')`

```js
import { StringElement } from '@speclynx/apidom-datamodel';

const element = new StringElement('hello');
element.id = 'greeting';
element.classes = ['important', 'message'];

element.id.toValue(); // => 'greeting'
element.classes.toValue(); // => ['important', 'message']
```

### StringElement

Represents a string value.

```js
import { StringElement } from '@speclynx/apidom-datamodel';

const str = new StringElement('hello');
str.toValue(); // => 'hello'
str.length; // => 5
```

### NumberElement

Represents a numeric value.

```js
import { NumberElement } from '@speclynx/apidom-datamodel';

const num = new NumberElement(42);
num.toValue(); // => 42
```

### BooleanElement

Represents a boolean value.

```js
import { BooleanElement } from '@speclynx/apidom-datamodel';

const bool = new BooleanElement(true);
bool.toValue(); // => true
```

### NullElement

Represents a null value.

```js
import { NullElement } from '@speclynx/apidom-datamodel';

const nil = new NullElement();
nil.toValue(); // => null
```

### ArrayElement

Represents an ordered collection of elements.

```js
import { ArrayElement } from '@speclynx/apidom-datamodel';

const arr = new ArrayElement([1, 2, 3]);
arr.length; // => 3
arr.get(0).toValue(); // => 1
arr.push(4);
arr.map((item) => item.toValue()); // => [1, 2, 3, 4]
arr.filter((item) => item.toValue() > 2); // => ArraySlice with 3, 4
```

### ObjectElement

Represents a collection of key-value pairs.

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';

const obj = new ObjectElement({ name: 'John', age: 30 });
obj.get('name').toValue(); // => 'John'
obj.set('email', 'john@example.com');
obj.keys(); // => ['name', 'age', 'email']
obj.values(); // => ['John', 30, 'john@example.com']
obj.hasKey('name'); // => true
```

ObjectElement supports generics for typed key-value pairs:

```ts
import { ObjectElement, StringElement, NumberElement } from '@speclynx/apidom-datamodel';

const typed = new ObjectElement<StringElement, NumberElement>({ a: 1, b: 2 });
```

### MemberElement

Represents a key-value pair within an ObjectElement.

```js
import { MemberElement } from '@speclynx/apidom-datamodel';

const member = new MemberElement('key', 'value');
member.key.toValue(); // => 'key'
member.value.toValue(); // => 'value'
```

---

## Higher-Order Elements

### RefElement

Represents a reference to another element by ID.

```js
import { RefElement, StringElement } from '@speclynx/apidom-datamodel';

const target = new StringElement('referenced');
target.id = 'target-id';

const ref = new RefElement('target-id');
ref.toValue(); // => 'target-id'
```

### LinkElement

Represents a hyperlink.

```js
import { LinkElement } from '@speclynx/apidom-datamodel';

const link = new LinkElement();
link.relation = 'self';
link.href = 'https://example.com';
```

### ParseResultElement

Represents the result of parsing a document. It contains the parsed API element and any annotations (errors, warnings) produced during parsing.

```js
import { ParseResultElement, ObjectElement, AnnotationElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

const parseResult = new ParseResultElement();

// Add the parsed result
const api = new ObjectElement({ openapi: '3.1.0' });
api.classes.push('result');
parseResult.push(api);

// Add annotations
const warning = new AnnotationElement('Deprecated feature used');
warning.classes.push('warning');
parseResult.push(warning);

// Access the result
parseResult.result; // => ObjectElement
parseResult.isEmpty; // => false

// Iterate over annotations
for (const annotation of parseResult.annotations) {
  console.log(toValue(annotation));
}
```

### AnnotationElement

Represents metadata about the parsing process, such as errors, warnings, or informational messages.

```js
import { AnnotationElement } from '@speclynx/apidom-datamodel';

// Create a warning annotation
const warning = new AnnotationElement('Multiple documents found, using first');
warning.classes.push('warning');

// Create an error annotation
const error = new AnnotationElement('Invalid syntax at line 10');
error.classes.push('error');

// Annotations can have a code for programmatic identification
error.code = 'INVALID_SYNTAX';
```

---

## Source Maps

Source maps track the original source position of each element in the parsed document.
Position properties are stored directly on elements (not nested in a separate object):

- `startLine` - Zero-based line number where the element begins
- `startCharacter` - Zero-based column number where the element begins
- `startOffset` - Zero-based character offset from the start of the document
- `endLine` - Zero-based line number where the element ends
- `endCharacter` - Zero-based column number where the element ends
- `endOffset` - Zero-based character offset where the element ends

All position values use **UTF-16 code units**, making them compatible with:
- [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/)
- JavaScript string indexing
- TextDocument APIs

### Accessing Source Positions

```js
import { StringElement } from '@speclynx/apidom-datamodel';

const element = new StringElement('hello');
element.startLine = 0;
element.startCharacter = 5;
element.startOffset = 5;
element.endLine = 0;
element.endCharacter = 12;
element.endOffset = 12;

console.log(element.startLine); // => 0
console.log(element.startOffset); // => 5
```

### SourceMapElement

`SourceMapElement` is a transitive element that stores source positions as a compact
VLQ-encoded string. It provides utilities for transferring and serializing source positions.

#### Transferring Source Positions

Use `SourceMapElement.transfer()` to copy position properties between any compatible shapes
(elements, AST nodes, or plain objects with position properties):

```js
import { SourceMapElement, StringElement } from '@speclynx/apidom-datamodel';

const source = new StringElement('source');
source.startLine = 1;
source.startCharacter = 2;
source.startOffset = 10;
source.endLine = 1;
source.endCharacter = 8;
source.endOffset = 16;

const target = new StringElement('target');
SourceMapElement.transfer(source, target);

console.log(target.startLine); // => 1
console.log(target.startOffset); // => 10
```

#### Creating from Source

Use `SourceMapElement.from()` to create a source map from any object with position properties.
Returns `undefined` if any position property is not a number:

```js
import { SourceMapElement, StringElement } from '@speclynx/apidom-datamodel';

const element = new StringElement('hello');
element.startLine = 0;
element.startCharacter = 0;
element.startOffset = 0;
element.endLine = 0;
element.endCharacter = 5;
element.endOffset = 5;

const sourceMap = SourceMapElement.from(element);
// sourceMap.content => 'sm1:AAAAKA' (VLQ-encoded positions)
```

#### Applying to Target

Use `sourceMap.applyTo()` to decode VLQ content and apply position properties to any target object:

```js
import { SourceMapElement, StringElement } from '@speclynx/apidom-datamodel';

const sourceMap = new SourceMapElement('sm1:AAAAKA');
const target = new StringElement('target');

sourceMap.applyTo(target);

console.log(target.startLine); // => 0
console.log(target.endOffset); // => 5
```

### SourceMapShape Interface

The `SourceMapShape` interface defines the shape for objects with source position properties:

```ts
import type { SourceMapShape } from '@speclynx/apidom-datamodel';

interface SourceMapShape {
  startLine?: number;
  startCharacter?: number;
  startOffset?: number;
  endLine?: number;
  endCharacter?: number;
  endOffset?: number;
}
```

This enables `SourceMapElement.transfer()` to work with any compatible object, not just elements.

---

## Extending Elements

You can create custom element types by extending the primitive elements.
This is useful for creating semantic elements that represent specific data structures.

### Creating a Custom Element

```js
import { ObjectElement, StringElement } from '@speclynx/apidom-datamodel';

class PersonElement extends ObjectElement {
  constructor(content, meta, attributes) {
    super(content, meta, attributes);
    this.element = 'person';
  }

  get name() {
    return this.get('name');
  }

  set name(value) {
    this.set('name', value);
  }

  get email() {
    return this.get('email');
  }

  set email(value) {
    this.set('email', value);
  }
}

const person = new PersonElement({ name: 'John', email: 'john@example.com' });
person.element; // => 'person'
person.name.toValue(); // => 'John'
person.email.toValue(); // => 'john@example.com'
```

### Registering Custom Elements

To use custom elements with serialization and namespace features, register them:

```js
import { Namespace } from '@speclynx/apidom-datamodel';

const namespace = new Namespace();
namespace.register('person', PersonElement);

// Now PersonElement will be used when deserializing 'person' elements
const serialiser = namespace.serialiser;
const refracted = { element: 'person', content: [] };
const element = serialiser.deserialise(refracted); // => PersonElement
```

---

## Refraction

The `refract` function converts JavaScript values to ApiDOM elements.

```js
import { refract } from '@speclynx/apidom-datamodel';

refract('hello'); // => StringElement('hello')
refract(42); // => NumberElement(42)
refract(true); // => BooleanElement(true)
refract(null); // => NullElement()
refract([1, 2, 3]); // => ArrayElement([NumberElement(1), NumberElement(2), NumberElement(3)])
refract([1, undefined, 3]); // => ArrayElement([NumberElement(1), NullElement(), NumberElement(3)])
refract({ a: 'b' }); // => ObjectElement({ a: StringElement('b') })
refract({ a: undefined }); // => ObjectElement({ a: undefined }) - undefined values are preserved
```

---

## Namespace

The Namespace class provides a registry for element classes and handles element detection and conversion.

```js
import { Namespace } from '@speclynx/apidom-datamodel';

const namespace = new Namespace();

// Convert JavaScript values to elements
namespace.toElement('hello'); // => StringElement('hello')
namespace.toElement(42); // => NumberElement(42)

// Register custom element classes
class CustomElement extends namespace.Element {
  element = 'custom';
}
namespace.register('custom', CustomElement);

// Get element class by name
const ElementClass = namespace.getElementClass('custom'); // => CustomElement
```

### Extending Namespace

You can register custom detection functions:

```js
import { Namespace, Element } from '@speclynx/apidom-datamodel';

class DateElement extends Element {
  element = 'date';
}

const namespace = new Namespace();
namespace.register('date', DateElement);
namespace.detect((value) => value instanceof Date, DateElement);

namespace.toElement(new Date()); // => DateElement
```

### Creating Namespace Plugins

It is possible to create plugin modules that define elements for custom namespaces.
Plugin modules should export a `namespace` function that takes an options object
containing an existing namespace to which you can add your elements:

```js
import { Namespace } from '@speclynx/apidom-datamodel';

// Define your plugin module (normally done in a separate file)
const plugin = {
  namespace: (options) => {
    const base = options.base;
    const ArrayElement = base.getElementClass('array');

    // Register custom elements
    base.register('category', ArrayElement);

    return base;
  }
};

// Create namespace and load the plugin
const namespace = new Namespace();
namespace.use(plugin);

// Now 'category' element is available
const CategoryElement = namespace.getElementClass('category');
```

Plugins can also define a `load` function for additional initialization:

```js
const plugin = {
  namespace: (options) => {
    // Register elements
  },
  load: (options) => {
    // Additional initialization after namespace setup
  }
};
```

### Serialization

The namespace provides serialization methods:

```js
import { Namespace, ObjectElement } from '@speclynx/apidom-datamodel';

const namespace = new Namespace();
const obj = new ObjectElement({ key: 'value' });

// Serialize to refract format
const refracted = namespace.toRefract(obj);
// => { element: 'object', content: [...] }

// Deserialize from refract format
const element = namespace.fromRefract(refracted);
// => ObjectElement({ key: 'value' })
```

---

## JSON Serialiser

Direct serialization without namespace:

```js
import { JSONSerialiser, ObjectElement } from '@speclynx/apidom-datamodel';

const serialiser = new JSONSerialiser();
const obj = new ObjectElement({ a: 1 });

// Serialize
const json = serialiser.serialise(obj);
// => { element: 'object', content: [...] }

// Deserialize
const element = serialiser.deserialise(json);
// => ObjectElement({ a: 1 })
```

---

## Element Operations

### Freezing

Elements can be frozen for immutability. Freezing also sets up parent references:

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';

const obj = new ObjectElement({ a: 1 });
obj.freeze();

obj.isFrozen; // => true
obj.get('a').parent === obj.getMember('a'); // => true
```

### Equality

Elements support deep equality checking:

```js
import { ArrayElement } from '@speclynx/apidom-datamodel';

const arr1 = new ArrayElement([1, 2, 3]);
const arr2 = new ArrayElement([1, 2, 3]);

arr1.equals([1, 2, 3]); // => true
arr1.equals(arr2.toValue()); // => true
```

### Creating References

Elements with IDs can create references to themselves:

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';

const obj = new ObjectElement({ data: 'value' });
obj.id = 'my-object';

const ref = obj.toRef();
ref.toValue(); // => 'my-object'
```

---

## ObjectSlice

ObjectSlice is a utility for working with filtered object members:

```js
import { ObjectElement } from '@speclynx/apidom-datamodel';

const obj = new ObjectElement({ a: 1, b: 2, c: 3 });
const slice = obj.filter((value) => value.toValue() > 1);

slice.keys(); // => ['b', 'c']
slice.values(); // => [2, 3]
```

---

## KeyValuePair

Internal structure used by MemberElement to store key-value pairs:

```js
import { KeyValuePair, StringElement, NumberElement } from '@speclynx/apidom-datamodel';

const pair = new KeyValuePair();
pair.key = new StringElement('name');
pair.value = new NumberElement(42);

pair.toValue(); // { key: 'name', value: 42 }
```

---

## Cloning

Functions for creating shallow and deep copies of ApiDOM elements.

### Shallow cloning

Creates a shallow clone of an ApiDOM element. The element itself is cloned,
but content references are shared (except for meta and attributes which are deep cloned
to preserve semantic information).

```js
import { ObjectElement, cloneShallow } from '@speclynx/apidom-datamodel';

const objectElement = new ObjectElement({ a: 'b' });
const objectElementShallowClone = cloneShallow(objectElement);
```

### Deep cloning

Creates a deep clone of an ApiDOM element. All nested elements are recursively cloned.
Handles cycles by memoizing visited objects.

```js
import { ObjectElement, cloneDeep } from '@speclynx/apidom-datamodel';

const objectElement = new ObjectElement({ a: 'b' });
const objectElementDeepClone = cloneDeep(objectElement);
```
