# @speclynx/apidom-parser-adapter-openapi-yaml-3-1

`@speclynx/apidom-parser-adapter-openapi-yaml-3-1` is a parser adapter for the **OpenAPI 3.1.x specification** in [YAML format](https://yaml.org/spec/1.2/spec.html) supporting the following versions:

- [OpenAPI 3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
- [OpenAPI 3.1.2](https://spec.openapis.org/oas/v3.1.2.html)



Under the hood this adapter uses [apidom-parser-adapter-yaml-1-2](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser-adapter-yaml-1-2)
to parse a source string into generic ApiDOM in [base ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom#base-namespace)
which is then refracted with [OpenAPI 3.1.x Refractors](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-openapi-3-1#refractors).

## Installation

You can install `@speclynx/apidom-parser-adapter-openapi-yaml-3-1` via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-parser-adapter-openapi-yaml-3-1
```

## Parser adapter API

This parser adapter is fully compatible with parser adapter interface required by [@speclynx/apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#mounting-parser-adapters)
and implements all required properties.

### mediaTypes

Defines list of media types that this parser adapter recognizes.

```js
[
  'application/vnd.oai.openapi;version=3.1.0',
  'application/vnd.oai.openapi+yaml;version=3.1.0',
  'application/vnd.oai.openapi;version=3.1.1',
  'application/vnd.oai.openapi+yaml;version=3.1.1',
  'application/vnd.oai.openapi;version=3.1.2',
  'application/vnd.oai.openapi+yaml;version=3.1.2',
]
```

### detect

[Detection](https://github.com/speclynx/apidom/blob/main/packages/apidom-parser-adapter-openapi-yaml-3-1/src/adapter.ts#L13) is based on a regular expression matching required OpenAPI 3.1.x specification symbols in YAML format.

### namespace

This adapter exposes an instance of [OpenAPI 3.1.x ApiDOM namespace](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-openapi-3-1#openapi-310-namespace).

### parse

`parse` function consumes various options as a second argument. Here is a list of these options:

Option | Type | Default | Description
--- | --- | --- | ---
<a name="specObj"></a>`specObj` | `Object` | [Specification Object](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-openapi-3-1/src/refractor/specification.ts) | This specification object drives the YAML AST transformation to OpenAPI 3.1.x ApiDOM namespace.
<a name="sourceMap"></a>`sourceMap` | `Boolean` | `false` | Indicate whether to generate source maps.
<a name="refractorOpts"></a>`refractorOpts` | `Object` | `{}` | Refractor options are [passed to refractors](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-openapi-3-1#refractor-plugins) during refracting phase.

All unrecognized arbitrary options will be ignored.

## Usage

This parser adapter can be used directly or indirectly via [apidom-parser](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser).

### Direct usage

During direct usage you don't need to provide `mediaType` as the `parse` function is already pre-bound
with [supported media types](#mediatypes).

```js
import { parse, detect } from '@speclynx/apidom-parser-adapter-openapi-yaml-3-1';

// detecting
await detect('openapi: 3.1.2'); // => true
await detect('test'); // => false

// parsing
const parseResult = await parse('openapi: 3.1.2', { sourceMap: true });
```

### Indirect usage

You can omit the `mediaType` option here, but please read [Word on detect vs mediaTypes](https://github.com/speclynx/apidom/tree/main/packages/apidom-parser#word-on-detect-vs-mediatypes) before you do so.

```js
import ApiDOMParser from '@speclynx/apidom-parser';
import * as openApiYamlAdapter from '@speclynx/apidom-parser-adapter-openapi-yaml-3-1';

const parser = new ApiDOMParser();

parser.use(openApiYamlAdapter);

const parseResult = await parser.parse('openapi: 3.1.2', { mediaType: openApiYamlAdapter.mediaTypes.latest('yaml') });
```
