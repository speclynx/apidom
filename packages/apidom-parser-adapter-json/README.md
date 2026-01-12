# @speclynx/apidom-parser-adapter-json

`@speclynx/apidom-parser-adapter-json` is a parser adapter for the [JSON format](https://www.json.org/json-en.html).

[CST](https://tree-sitter.github.io/tree-sitter/using-parsers#syntax-nodes) produced by lexical analysis is [syntactically analyzed](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-json/src/syntactic-analysis) and
ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace) is produced.

## Installation

You can install `@speclynx/apidom-parser-adapter-json` via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-json
```

## Parse phases

The parse stage takes JSON string and produces ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace).
There are two phases of parsing: **Lexical Analysis** and **Syntactic Analysis**.

### Lexical Analysis

Lexical Analysis will take a JSON string and turn it into a stream of tokens.
[tree-sitter](https://www.npmjs.com/package/tree-sitter) / [web-tree-sitter](https://www.npmjs.com/package/web-tree-sitter) is used as an underlying lexical analyzer.

### Syntactic Analysis

Syntactic Analysis will take a stream of tokens and turn it into an ApiDOM representation.
[CST](https://tree-sitter.github.io/tree-sitter/using-parsers#syntax-nodes) produced by lexical analysis is [syntactically analyzed](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-json/src/syntactic-analysis)
and ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace) is produced.

This analysis directly turns tree-sitter CST into ApiDOM in a single traversal pass, making it highly performant.

```js
import { parse } from '@speclynx/apidom-parser-adapter-json';

const parseResult = await parse('{"prop": "value"}');
```

## Parser adapter API

This parser adapter is fully compatible with parser adapter interface required by [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#mounting-parser-adapters)
and implements all required properties.

### mediaTypes

Defines list of media types that this parser adapter recognizes.

```js
['application/json']
```

### detect

[Detection](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-json/src/adapter.ts#L3) is based on using [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) to indicate whether the provided source string is or isn't JSON string.

### namespace

This adapter exposes an instance of [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace).

### parse

`parse` function consumes various options as a second argument. Here is a list of these options:

Option | Type | Default | Description
--- | --- | --- | ---
<a name="sourceMap"></a>`sourceMap` | `Boolean` | `false` | Indicate whether to generate source maps.

All unrecognized arbitrary options will be ignored.

## Usage

This parser adapter can be used directly or indirectly via [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser).

### Direct usage

During direct usage you don't need to provide `mediaType` as the `parse` function is already pre-bound
with [supported media types](#mediatypes).

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-json';

// detecting
await detect('{"prop": "value"}'); // => true
await detect('test'); // => false

// parsing
const parseResult = await parse('{"prop": "value"}', { sourceMap: true });
```

### Indirect usage

You can omit the `mediaType` option here, but please read [Word on detect vs mediaTypes](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#word-on-detect-vs-mediatypes) before you do so.

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as jsonParserAdapter from '@speclynx/apidom-parser-adapter-json';

const parser = new ApiDOMParser();

parser.use(jsonParserAdapter);

const parseResult = await parser.parse('{"prop", "value"}', { mediaType: jsonParserAdapter.mediaTypes.latest('json') });
```
