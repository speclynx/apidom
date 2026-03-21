# @speclynx/apidom-parser-adapter-overlay-json-1

`@speclynx/apidom-parser-adapter-overlay-json-1` is a parser adapter for parsing JSON documents into the Overlay 1.x.y namespace.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-overlay-json-1
```

## Usage

This adapter can be used standalone or with the `@speclynx/apidom-parser` unified parser.

### Standalone

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-overlay-json-1';

// detect if a source string is an Overlay 1.x.y JSON document
await detect('{"overlay": "1.1.0"}'); // => true

// parse an Overlay 1.x.y JSON document
const parseResult = await parse('{"overlay": "1.1.0", "info": {"title": "My overlay", "version": "1.0.0"}, "actions": []}', {
  sourceMap: true,
});
```

### With unified parser

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as overlayJsonAdapter from '@speclynx/apidom-parser-adapter-overlay-json-1';

const parser = new ApiDOMParser().use(overlayJsonAdapter);

const parseResult = await parser.parse('{"overlay": "1.1.0", "info": {"title": "My overlay", "version": "1.0.0"}, "actions": []}');
```
