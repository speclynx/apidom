# @speclynx/apidom-overlay

`@speclynx/apidom-overlay` applies [Overlay 1.x.y](https://spec.openapis.org/overlay/v1.1.0.html) documents to API definitions.
The [Overlay Specification](https://spec.openapis.org/overlay/v1.1.0.html) defines a mechanism for modifying
existing API documents without directly editing the original, using [JSONPath (RFC 9535)](https://www.rfc-editor.org/rfc/rfc9535.html)
expressions to target specific nodes and apply updates, copies, or removals.

## Installation

You can install this package via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @speclynx/apidom-overlay
```

## Usage

This package provides three levels of API for applying overlays:

### Applying from file/URL

`applyOverlay` parses an overlay document, resolves the target (from `targetURI` or the overlay's `extends` field),
and applies all actions. The target is parsed with style preservation for round-trip fidelity.

```js
import { applyOverlay } from '@speclynx/apidom-overlay';
import { toYAML } from '@speclynx/apidom-core';

// target from extends field
const result = await applyOverlay('/path/to/overlay.yaml');

// explicit target
const result = await applyOverlay('/path/to/overlay.yaml', '/path/to/openapi.yaml');

// serialize back to YAML with preserved formatting
const yaml = toYAML(result.api, { preserveStyle: true });
```

### Applying to ApiDOM elements

`applyOverlayApiDOM` applies an entire overlay document to a target element. Accepts `Overlay1Element`
or `ParseResultElement`. Immutable by default — returns a new element.

```js
import { refract } from '@speclynx/apidom-datamodel';
import { refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';
import { applyOverlayApiDOM } from '@speclynx/apidom-overlay';

const overlay = refractOverlay1({
  overlay: '1.1.0',
  info: { title: 'My overlay', version: '1.0.0' },
  actions: [
    { target: '$.info', update: { description: 'Added by overlay' } },
    { target: '$.info.title', update: 'Renamed API' },
  ],
});
const target = refract({
  openapi: '3.1.0',
  info: { title: 'Original', version: '1.0.0' },
});

const result = applyOverlayApiDOM(overlay, target);
```

`applyActionApiDOM` applies a single overlay action. Useful for programmatic, step-by-step application.

```js
import { refract } from '@speclynx/apidom-datamodel';
import { refractAction } from '@speclynx/apidom-ns-overlay-1';
import { applyActionApiDOM } from '@speclynx/apidom-overlay';

const action = refractAction({
  target: '$.info.title',
  update: 'New Title',
});
const target = refract({ info: { title: 'Old Title', version: '1.0.0' } });

const result = applyActionApiDOM(action, target);
```

### Applying to plain JavaScript objects (POJO)

`applyOverlayPOJO` and `applyActionPOJO` accept and return plain JavaScript objects —
no need to manually refract or serialize.

```js
import { applyOverlayPOJO, applyActionPOJO } from '@speclynx/apidom-overlay';

// full overlay
const result = applyOverlayPOJO(
  {
    overlay: '1.1.0',
    info: { title: 'My overlay', version: '1.0.0' },
    actions: [
      { target: '$.info.title', update: 'Renamed API' },
    ],
  },
  {
    openapi: '3.1.0',
    info: { title: 'Original', version: '1.0.0' },
  },
);
// result is a plain object: { openapi: '3.1.0', info: { title: 'Renamed API', version: '1.0.0' } }

// single action
const updated = applyActionPOJO(
  { target: '$.info.title', update: 'New Title' },
  { info: { title: 'Old Title' } },
);
```

## Overlay spec semantics

The implementation follows [Overlay 1.1.0](https://spec.openapis.org/overlay/v1.1.0.html) merge rules:

| Scenario | Behavior |
|---|---|
| Both objects | Recursively merge — properties in target only are unchanged, properties in update only are inserted, overlapping properties merge recursively |
| Both arrays | Concatenate |
| Both primitives | Replace |
| Type mismatch | Throws `OverlayError` |
| Zero-match target | Action succeeds without changes (unless `strict: true`) |
| Multiple targets | All must be the same type (all objects, all arrays, or all primitives) |
| `remove: true` | Removes matched nodes; when combined with `update`, the update has no effect |
| Action ordering | Applied sequentially — each action modifies the result of the previous |

## Options

### ApplyOptions

Passed to `applyActionApiDOM`, `applyOverlayApiDOM`, and `applyOverlay`:

| Option | Type | Default | Description |
|---|---|---|---|
| `deepmerge` | `DeepMergeUserOptions` | `{}` | Custom [deepmerge options](https://github.com/speclynx/apidom/blob/main/packages/apidom-core/src/merge/deepmerge.ts) from `@speclynx/apidom-core`. Default `customMerge` enforces Overlay spec type compatibility. |
| `strict` | `boolean` | `false` | When `true`, throws `OverlayError` if any action's target JSONPath matches zero nodes. |
| `immutable` | `boolean` | `true` | When `true` (default), returns a new element without mutating the input. Set to `false` for in-place mutation. |

### ApplyOverlayOptions

Extends `ApplyOptions` with all [`@speclynx/apidom-reference` options](https://github.com/speclynx/apidom/blob/main/packages/apidom-reference/README.md)
for controlling parsing, resolving, and dereferencing of the overlay and target documents.

## Validation

`validateAction` checks an `ActionElement` for spec conformance before applying:

```js
import { refractAction } from '@speclynx/apidom-ns-overlay-1';
import { validateAction } from '@speclynx/apidom-overlay';

const action = refractAction({ target: '$.info', update: { title: 'New' } });
const result = validateAction(action);

if (!result.valid) {
  console.error(result.error.message);
  // result.error.action — the ActionElement that failed
  // result.error.member — the MemberElement of the invalid field (if applicable)
}
```

## Error handling

All errors thrown by this package are instances of `OverlayError`, which extends `ApiDOMStructuredError`.
Errors carry structured context for diagnostics:

```js
import { applyActionApiDOM, OverlayError } from '@speclynx/apidom-overlay';

try {
  applyActionApiDOM(action, target);
} catch (error) {
  if (error instanceof OverlayError) {
    console.error(error.message);
    // error.action — the ActionElement that caused the error (with source map)
    // error.member — the MemberElement of the problematic field
  }
}
```
