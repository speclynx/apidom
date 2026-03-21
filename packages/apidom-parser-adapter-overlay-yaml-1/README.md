# @speclynx/apidom-parser-adapter-overlay-yaml-1

`@speclynx/apidom-parser-adapter-overlay-yaml-1` is a parser adapter for the [Overlay 1.1.0 specification](https://spec.openapis.org/overlay/v1.1.0.html) in [YAML format](https://yaml.org/spec/1.2/spec.html).
Under the hood this adapter uses [apidom-parser-adapter-yaml-1-2](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser-adapter-yaml-1-2)
to parse a source string into generic ApiDOM in [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace)
which is then refracted with [Overlay 1.x.y Refractors](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-overlay-1#refractors).

## Installation

You can install `@speclynx/apidom-parser-adapter-overlay-yaml-1` via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-overlay-yaml-1
```

## Parser adapter API

This parser adapter is fully compatible with parser adapter interface required by [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#mounting-parser-adapters)
and implements all required properties.

### mediaTypes

Defines list of media types that this parser adapter recognizes.

```js
[
  'application/vnd.oai.overlay;version=1.0.0',
  'application/vnd.oai.overlay+yaml;version=1.0.0',
  'application/vnd.oai.overlay;version=1.1.0',
  'application/vnd.oai.overlay+yaml;version=1.1.0',
]
```

### detect

[Detection](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-overlay-yaml-1/src/adapter.ts#L13) is based on a regular expression matching required Overlay 1.1.0 specification symbols in YAML format.

### namespace

This adapter exposes an instance of [Overlay 1.x.y ApiDOM namespace](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-overlay-1/README.md#overlay-110-namespace).

### parse

`parse` function consumes various options as a second argument. Here is a list of these options:

Option | Type | Default                                                                                                                            | Description
--- | --- |------------------------------------------------------------------------------------------------------------------------------------| ---
<a name="specObj"></a>`specObj` | `Object` | [Specification Object](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-overlay-1/src/refractor/specification.ts) | This specification object drives the YAML AST transformation to Overlay 1.x.y ApiDOM namespace.
<a name="sourceMap"></a>`sourceMap` | `Boolean` | `false`                                                                                                                            | Indicate whether to generate source maps.
<a name="refractorOpts"></a>`refractorOpts` | `Object` | `{}`                                                                                                                               | Refractor options are [passed to refractors](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-overlay-1#refractor-plugins) during refracting phase.

All unrecognized arbitrary options will be ignored.

## Usage

This parser adapter can be used directly or indirectly via [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser).

### Direct usage

During direct usage you don't need to provide `mediaType` as the `parse` function is already pre-bound
with [supported media types](#mediatypes).

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

// detecting
await detect('overlay: 1.1.0'); // => true
await detect('test'); // => false

// parsing
const parseResult = await parse('overlay: 1.1.0', { sourceMap: true });
```

### Indirect usage

You can omit the `mediaType` option here, but please read [Word on detect vs mediaTypes](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#word-on-detect-vs-mediatypes) before you do so.

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as overlayYamlAdapter from '@speclynx/apidom-parser-adapter-overlay-yaml-1';

const parser = new ApiDOMParser();

parser.use(overlayYamlAdapter);

const parseResult = await parser.parse('overlay: 1.1.0', { mediaType: overlayYamlAdapter.mediaTypes.latest('yaml') });
```
