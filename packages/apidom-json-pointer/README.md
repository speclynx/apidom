# @speclynx/apidom-json-pointer

`apidom-json-pointer` is a package that evaluates [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) against ApiDOM.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-json-pointer
```

The API of this package is fully compliant with [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901) and supports all aspects of JSON Pointer.
Uses [@swaggerexpert/json-pointer](https://www.npmjs.com/package/@swaggerexpert/json-pointer) under the hood and fully reflects its API.

Evaluation is contextual to [ApiDOM realm](https://github.com/swaggerexpert/json-pointer?tab=readme-ov-file#apidom-evaluation-realm) - meaning `evaluate` function
expects only ApiDOM as the first argument.

```js
import { evaluate } from '@speclynx/apidom-json-pointer';
```
