# @speclynx/apidom-parser-adapter-yaml-1-2

`@speclynx/apidom-parser-adapter-yaml-1-2` is a parser adapter for the [YAML 1.2 format](https://yaml.org/spec/1.2/spec.html).

[CST](https://tree-sitter.github.io/tree-sitter/using-parsers#syntax-nodes) produced by lexical analysis is [syntactically analyzed](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-yaml-1-2/src/syntactic-analysis) and
ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace) is produced.

## Installation

You can install `@speclynx/apidom-parser-adapter-yaml-1-2` via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-yaml-1-2
```

## Parse phases

The parse stage takes YAML string and produces ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace).
There are two phases of parsing: **Lexical Analysis** and **Syntactic Analysis**.

### Lexical Analysis

Lexical Analysis will take a YAML string and turn it into a stream of tokens.
[tree-sitter](https://www.npmjs.com/package/tree-sitter) / [web-tree-sitter](https://www.npmjs.com/package/web-tree-sitter) is used as an underlying lexical analyzer.

### Syntactic Analysis

Syntactic Analysis will take a stream of tokens and turn it into an ApiDOM representation.
[CST](https://tree-sitter.github.io/tree-sitter/using-parsers#syntax-nodes) produced by lexical analysis is [syntactically analyzed](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-yaml-1-2/src/syntactic-analysis)
and ApiDOM structure using [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace) is produced.

## Parser adapter API

This parser adapter is fully compatible with parser adapter interface required by [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#mounting-parser-adapters)
and implements all required properties.

### mediaTypes

Defines list of media types that this parser adapter recognizes.

```js
['text/yaml', 'application/yaml']
```

### detect

Detection indicates whether the provided source string is valid YAML.

Option | Type | Default | Description
--- | --- | --- | ---
<a name="detect-strict"></a>`strict` | `Boolean` | `false` | Use strict detection mode ([yaml](https://www.npmjs.com/package/yaml) library).

In default mode, detection uses tree-sitter for parsing with error recovery.
In strict mode, detection uses the [yaml](https://www.npmjs.com/package/yaml) library which is faster.

### namespace

This adapter exposes an instance of [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace).

### parse

`parse` function consumes various options as a second argument. Here is a list of these options:

Option | Type | Default | Description
--- | --- | --- | ---
<a name="sourceMap"></a>`sourceMap` | `Boolean` | `false` | Indicate whether to generate source maps.
<a name="strict"></a>`strict` | `Boolean` | `false` | Use strict parsing mode ([yaml](https://www.npmjs.com/package/yaml) library). When `true`, parsing is faster but doesn't support source maps.

All unrecognized arbitrary options will be ignored.

#### Parsing modes

This adapter supports two parsing modes:

**Tree-sitter mode** (default, `strict: false`):
- Uses [web-tree-sitter](https://www.npmjs.com/package/web-tree-sitter) for parsing
- Provides error recovery for malformed YAML
- Supports source map generation
- Full YAML 1.2 spec compliance with custom AST

**Strict mode** (`strict: true`):
- Uses [yaml](https://www.npmjs.com/package/yaml) library for parsing
- Faster performance
- Does not support source maps (throws error if both `strict` and `sourceMap` are `true`)

## Usage

This parser adapter can be used directly or indirectly via [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser).

### Direct usage

During direct usage you don't need to provide `mediaType` as the `parse` function is already pre-bound
with [supported media types](#mediatypes).

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-yaml-1-2';

// detecting (tree-sitter mode - default)
await detect('prop: value'); // => true
await detect('{invalid:'); // => false

// detecting (strict mode)
await detect('prop: value', { strict: true }); // => true

// parsing (tree-sitter mode - default, with source maps)
const parseResult = await parse('prop: value', { sourceMap: true });

// parsing (strict mode - faster, no source maps)
const parseResultStrict = await parse('prop: value', { strict: true });
```

### Indirect usage

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as yamlParserAdapter from '@speclynx/apidom-parser-adapter-yaml-1-2';

const parser = new ApiDOMParser();

parser.use(yamlParserAdapter);

const parseResult = await parser.parse('prop: value', { mediaType: yamlParserAdapter.mediaTypes.latest('yaml') });
```
