# @speclynx/apidom-ns-openapi-3-1

`@speclynx/apidom-ns-openapi-3-1` contains ApiDOM namespace specific to **OpenAPI 3.1.x specification**, supporting the following versions:

- [OpenAPI 3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html)
- [OpenAPI 3.1.2](https://spec.openapis.org/oas/v3.1.2.html)

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-ns-openapi-3-1
```

## OpenAPI 3.1.0 namespace

OpenAPI 3.1.0 namespace consists of [number of elements](https://github.com/speclynx/apidom/tree/main/packages/apidom-ns-openapi-3-1/src/elements) implemented on top
of [primitive ones](https://github.com/refractproject/minim/tree/master/lib/primitives).

```js
import { createNamespace } from '@speclynx/apidom-core';
import openApi3_1Namespace from '@speclynx/apidom-ns-openapi-3-1';

const namespace = createNamespace(openApi3_1Namespace);

const objectElement = new namespace.elements.Object();
const openApiElement = new namespace.elements.OpenApi3_1();
```

When namespace instance is created in this way, it will extend the base namespace
with the namespace provided as an argument.

Elements from the namespace can also be used directly by importing them.

```js
import { OpenApi3_1Element, InfoElement } from '@speclynx/apidom-ns-openapi-3-1';

const infoElement = new InfoElement();
const openApiElement = new OpenApi3_1Element();
```

## Predicates

This package exposes [predicates](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-openapi-3-1/src/predicates.ts)
for all higher order elements that are part of this namespace.

```js
import { isOpenApi3_1Element, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const openApiElement = new OpenApi3_1Element();

isOpenApi3_1Element(openApiElement); // => true
```

## Traversal

Traversing ApiDOM in this namespace is possible by using `visit` function from `apidom` package.
This package comes with its own [keyMap](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-openapi-3-1/src/traversal/visitor.ts#L11) and [nodeTypeGetter](https://github.com/speclynx/apidom/blob/main/packages/apidom-ns-openapi-3-1/src/traversal/visitor.ts#L4).
To learn more about these `visit` configuration options please refer to [@speclynx/apidom-ast documentation](https://github.com/speclynx/apidom/blob/main/packages/apidom-ast/README.md#visit).

```js
import { visit } from '@speclynx/apidom-core';
import { OpenApi3_1Element, keyMap, getNodeType } from '@speclynx/apidom-ns-openapi-3-1';

const element = new OpenApi3_1Element();

const visitor = {
  OpenApi3_1Element(openApiElement) {
    console.dir(openApiElement);
  },
};

visit(element, visitor, { keyMap, nodeTypeGetter: getNodeType });
```

## Refractors

Refractor is a special layer inside the namespace that can transform either JavaScript structures
or generic ApiDOM structures into structures built from elements of this namespace.

**Refracting JavaScript structures**:

```js
import { InfoElement } from '@speclynx/apidom-ns-openapi-3-1';

const object = {
    title: 'my title',
    description: 'my description',
    version: '0.1.0',
};

InfoElement.refract(object); // => InfoElement({ title, description, version })
```

**Refracting generic ApiDOM structures**:

```js
import { ObjectElement } from '@speclynx/apidom-core';
import { InfoElement } from '@speclynx/apidom-ns-openapi-3-1';

const objectElement = new ObjectElement({
    title: 'my title',
    description: 'my description',
    version: '0.1.0',
});

InfoElement.refract(objectElement); // => InfoElement({ title = 'my title', description = 'my description', version = '0.1.0' })
```

### Refractor plugins

Refractors can accept plugins as a second argument of refract static method.

```js
import { ObjectElement } from '@speclynx/apidom-core';
import { InfoElement } from '@speclynx/apidom-ns-openapi-3-1';

const objectElement = new ObjectElement({
    title: 'my title',
    description: 'my description',
    version: '0.1.0',
});

const plugin = ({ predicates, namespace }) => ({
  name: 'plugin',
  pre() {
      console.dir('runs before traversal');
  },
  visitor: {
    InfoElement(infoElement) {
      infoElement.version = '2.0.0';
    },
  },
  post() {
      console.dir('runs after traversal');
  },
});

InfoElement.refract(objectElement, { plugins: [plugin] }); // => InfoElement({ title = 'my title', description = 'my description', version = '2.0.0' })
```

You can define as many plugins as needed to enhance the resulting namespaced ApiDOM structure.
If multiple plugins with the same visitor method are defined, they run in parallel (just like in Babel).

#### Replace Empty Element plugin

This plugin is specific to YAML 1.2 format, which allows defining key-value pairs with empty key,
empty value, or both. If the value is not provided in YAML format, this plugin compensates for
this missing value with the most appropriate semantic element type.

```js
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginReplaceEmptyElement, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
info:
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginReplaceEmptyElement()],
});

// =>
// (OpenApi3_1Element
//   (MemberElement
//     (StringElement)
//     (OpenapiElement))
//   (MemberElement
//     (StringElement)
//     (InfoElement)))

// => without the plugin the result would be as follows:
// (OpenApi3_1Element
//   (MemberElement
//     (StringElement)
//     (OpenapiElement))
//   (MemberElement
//     (StringElement)
//     (StringElement)))
```

#### Normalize Operation.operationId fields plugin

Existing `Operation.operationId` fields are normalized into snake case form.
Operation Objects, that do not define operationId field, are left untouched.
Original operationId is stored in meta and as new `__originalOperationId` field.
This plugin also guarantees the uniqueness of all defined Operation.operationId fields,
and make sure Link.operationId fields are pointing to correct and normalized Operation.operationId fields.

```js
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginNormalizeOperationIds, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
paths:
  /:
    get:
      operationId: get operation ^
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginNormalizeOperationIds()],
});

toValue(openApiElement);
// =>
// {
//   "openapi": "3.1.0",
//   "paths": {
//     "/": {
//       "get": {
//         "operationId": "getoperation_"
//       }
//     }
//   }
// }
```
This plugin also accepts custom normalization function that will determine how normalized Operation.operationId fields
should look like.

```typescript
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginNormalizeOperationIds, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
paths:
  /:
    get:
      operationId: get operation ^
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginNormalizeOperationIds({
    operationIdNormalizer: (operationId: string, path: string, method: string): string => {
      // operationId - value of Original.operationId field
      // path - field pattern of Paths Object under which Path Item containing this Operation is registered
      // method - name of HTTP method under which the Operation is registered in Path Item
    },
  })],
});

toValue(openApiElement);
// =>
// {
//   "openapi": "3.1.0",
//   "paths": {
//     "/": {
//       "get": {
//         "operationId": "<normalized-operation-id>"
//       }
//     }
//   }
// }
```

#### Normalize Parameter Objects plugin

Duplicates Parameters from Path Items to Operation Objects using following rules:

- If a parameter is already defined at the Path Item, the new definition will override it but can never remove it
- The list MUST NOT include duplicated parameters
- A unique parameter is defined by a combination of a name and location.

```js
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginNormalizeParameters, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
paths:
  /:
    parameters:
      - name: param1
        in: query
      - name: param2
        in: query
    get: {}
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginNormalizeParameters()],
});

toValue(openApiElement);
// =>
// {
//   "openapi": "3.1.0",
//   "paths": {
//   "/": {
//     "parameters": [
//       {
//         "name": "param1",
//         "in": "query"
//       },
//       {
//         "name": "param2",
//         "in": "query"
//       }
//     ],
//     "get": {
//       "parameters": [
//          {
//            "name": "param1",
//            "in": "query"
//          },
//          {
//            "name": "param2",
//            "in": "query"
//          }
//        ],
//      }
//    }
// }
```

#### Normalize Security Requirements Objects plugin

`Operation.security` definition overrides any declared top-level security from OpenAPI.security field.
If Operation.security field is not defined, this field will inherit security from OpenAPI.security field.

```js
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginNormalizeSecurityRequirements, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
security:
  - petstore_auth:
      - write:pets
      - read:pets
paths:
  /:
    get: {}
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginNormalizeSecurityRequirements()],
});

toValue(openApiElement);
// =>
// {
//   "openapi": "3.1.0",
//   "security": [
//     {
//       "petstore_auth": [
//         "write:pets",
//         "read:pets"
//       ]
//     }
//   ],
//   "paths": {
//     "/": {
//       "get": {
//         "security": [
//           {
//             "petstore_auth": [
//               "write:pets",
//               "read:pets"
//             ]
//           }
//         ]
//       }
//     }
//   }
// }
```

#### Normalize Server Objects plugin

List of Server Objects can be defined in OpenAPI 3.1 on multiple levels:

- OpenAPI.servers
- PathItem.servers
- Operation.servers

If an alternative server object is specified at the Path Item Object level, it will override OpenAPI.servers.
If an alternative server object is specified at the Operation Object level, it will override PathItem.servers and OpenAPI.servers respectively.

```js
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';
import { refractorPluginNormalizeServers, OpenApi3_1Element } from '@speclynx/apidom-ns-openapi-3-1';

const yamlDefinition = `
openapi: 3.1.0
servers:
 - url: https://example.com/
   description: production server
paths:
  /:
    get: {}
`;
const apiDOM = await parse(yamlDefinition);
const openApiElement = OpenApi3_1Element.refract(apiDOM.result, {
  plugins: [refractorPluginNormalizeServers()],
});

toValue(openApiElement);
// =>
// {
//   "openapi": "3.1.0",
//   "servers": [
//     {
//       "url": "https://example.com/",
//       "description": "production server"
//     }
//   ],
//   "paths": {
//     "/": {
//       "servers": [
//         {
//           "url": "https://example.com/",
//           "description": "production server"
//         }
//       ],
//       "get": {
//         "servers": [
//           {
//             "url": "https://example.com/",
//             "description": "production server"
//           }
//         ]
//       }
//     }
//   }
// }
```

## Implementation progress

Only fully implemented specification objects should be checked here.

- [x] [OpenAPI Object](https://spec.openapis.org/oas/v3.1.2.html#openapi-object)
- [x] [Info Object](https://spec.openapis.org/oas/v3.1.2.html#info-object)
- [x] [Contact Object](https://spec.openapis.org/oas/v3.1.2.html#contact-object)
- [x] [License Object](https://spec.openapis.org/oas/v3.1.2.html#license-object)
- [x] [Server Object](https://spec.openapis.org/oas/v3.1.2.html#server-object)
- [x] [Server Variable Object](https://spec.openapis.org/oas/v3.1.2.html#server-variable-object)
- [x] [Components Object](https://spec.openapis.org/oas/v3.1.2.html#components-object)
- [x] [Paths Object](https://spec.openapis.org/oas/v3.1.2.html#paths-object)
- [x] [Path Item Object](https://spec.openapis.org/oas/v3.1.2.html#path-item-object)
- [x] [Operation Object](https://spec.openapis.org/oas/v3.1.2.html#operation-object)
- [x] [External Documentation Object](https://spec.openapis.org/oas/v3.1.2.html#external-documentation-object)
- [x] [Parameter Object](https://spec.openapis.org/oas/v3.1.2.html#parameter-object)
- [x] [Request Body Object](https://spec.openapis.org/oas/v3.1.2.html#request-body-object)
- [x] [Media Type Object](https://spec.openapis.org/oas/v3.1.2.html#media-type-object)
- [x] [Encoding Object](https://spec.openapis.org/oas/v3.1.2.html#encoding-object)
- [x] [Responses Object](https://spec.openapis.org/oas/v3.1.2.html#responses-object)
- [x] [Callback Object](https://spec.openapis.org/oas/v3.1.2.html#callback-object)
- [x] [Example Object](https://spec.openapis.org/oas/v3.1.2.html#example-object)
- [x] [Link Object](https://spec.openapis.org/oas/v3.1.2.html#link-object)
- [x] [Header Object](https://spec.openapis.org/oas/v3.1.2.html#header-object)
- [x] [Tag Object](https://spec.openapis.org/oas/v3.1.2.html#tag-object)
- [x] [Reference Object](https://spec.openapis.org/oas/v3.1.2.html#reference-object)
- [x] [Schema Object](https://spec.openapis.org/oas/v3.1.2.html#schema-object)
- [x] [Discriminator Object](https://spec.openapis.org/oas/v3.1.2.html#discriminator-object)
- [x] [XML Object](https://spec.openapis.org/oas/v3.1.2.html#xml-object)
- [x] [Security Scheme Object](https://spec.openapis.org/oas/v3.1.2.html#security-scheme-object)
- [x] [OAuth Flows Object](https://spec.openapis.org/oas/v3.1.2.html#oauth-flows-object)
- [x] [OAuth Flow Object](https://spec.openapis.org/oas/v3.1.2.html#oauth-flow-object)
- [x] [Security Requirement Object](https://spec.openapis.org/oas/v3.1.2.html#security-requirement-object)
- [x] [Specification Extensions](https://spec.openapis.org/oas/v3.1.2.html#specification-extensions)
