# @speclynx/apidom-json-path

`apidom-json-path` is a package that evaluates [JSONPath](https://www.rfc-editor.org/rfc/rfc9535.html) expressions against ApiDOM.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-json-path
```

The API of this package is fully compliant with [RFC 9535](https://www.rfc-editor.org/rfc/rfc9535.html) and supports all aspects of JSONPath.
Uses [@swaggerexpert/jsonpath](https://www.npmjs.com/package/@swaggerexpert/jsonpath) under the hood and fully reflects its API.

Evaluation is contextual to ApiDOM realm (`ApiDOMEvaluationRealm`) - meaning `evaluate` function
expects only ApiDOM as the first argument.

```js
import { evaluate, ApiDOMEvaluationRealm } from '@speclynx/apidom-json-path';
```
