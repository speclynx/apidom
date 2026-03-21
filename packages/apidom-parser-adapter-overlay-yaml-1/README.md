# @speclynx/apidom-parser-adapter-overlay-yaml-1

`@speclynx/apidom-parser-adapter-overlay-yaml-1` is a parser adapter for parsing YAML documents into the Overlay 1.x.y namespace.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-overlay-yaml-1
```

## Usage

This adapter can be used standalone or with the `@speclynx/apidom-parser` unified parser.

### Standalone

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

// detect if a source string is an Overlay 1.x.y YAML document
await detect('overlay: "1.1.0"'); // => true

// parse an Overlay 1.x.y YAML document
const parseResult = await parse('overlay: "1.1.0"\ninfo:\n  title: My overlay\n  version: "1.0.0"\nactions: []', {
  sourceMap: true,
});
```

### With unified parser

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as overlayYamlAdapter from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

const parser = new ApiDOMParser().use(overlayYamlAdapter);

const parseResult = await parser.parse('overlay: "1.1.0"\ninfo:\n  title: My overlay\n  version: "1.0.0"\nactions: []');
```
