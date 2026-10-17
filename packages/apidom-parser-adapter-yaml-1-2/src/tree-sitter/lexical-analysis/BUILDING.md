# tree-sitter-yaml.wasm

`tree-sitter-yaml.wasm` is built from [tree-sitter-yaml](https://github.com/tree-sitter-grammars/tree-sitter-yaml)
`master` (`a1c4812`) with the patches in [`patches/`](./patches) applied, in order:

| Patch | Source | Fixes |
|---|---|---|
| `0001-large-documents.patch` | [tree-sitter-grammars/tree-sitter-yaml#35](https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/35) (`8025f83`) | documents larger than 32,768 lines |
| `0002-deep-nesting.patch` | [tree-sitter-grammars/tree-sitter-yaml#47](https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/47) (`ebf98e2`) | out-of-bounds write when serializing the scanner state of deeply nested documents |
| `0003-flow-explicit-key-without-value.patch` | [speclynx/apidom#648](https://github.com/speclynx/apidom/issues/648) | explicit flow pair without a value (e.g. `{ ? a }`) being a syntax error |

A patch taken from an upstream pull request is that pull request's change on top of `a1c4812`. Once it's merged
upstream, move the base commit past it and delete the patch.

Build it with the `tree-sitter-cli` version that matches the pinned `web-tree-sitter` version. Patches may change
`grammar.js`, so the parser is generated before it's built:

```sh
 $ git clone https://github.com/tree-sitter-grammars/tree-sitter-yaml && cd tree-sitter-yaml
 $ git checkout a1c4812
 $ git apply <apidom>/packages/apidom-parser-adapter-yaml-1-2/src/tree-sitter/lexical-analysis/patches/*.patch
 $ npx tree-sitter-cli@0.27.1 generate
 $ npx tree-sitter-cli@0.27.1 test
 $ npx tree-sitter-cli@0.27.1 build --wasm
 $ cp tree-sitter-yaml.wasm <apidom>/packages/apidom-parser-adapter-yaml-1-2/src/tree-sitter/lexical-analysis/
```

`tree-sitter-cli` downloads the [wasi-sdk](https://github.com/WebAssembly/wasi-sdk) toolchain on first use, so neither Emscripten nor Docker is required.
