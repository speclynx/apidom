# tree-sitter-yaml.wasm

`tree-sitter-yaml.wasm` is built from [tree-sitter-yaml](https://github.com/tree-sitter-grammars/tree-sitter-yaml)
`master` (`a1c4812`) with these pull requests merged in:

- [tree-sitter-grammars/tree-sitter-yaml#35](https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/35) (`8025f83`), which supports documents larger than 32,768 lines;
- [tree-sitter-grammars/tree-sitter-yaml#47](https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/47) (`ebf98e2`), which fixes an out-of-bounds write when serializing the scanner state of deeply nested documents.

and these patches from [`patches/`](./patches) applied:

- `flow-explicit-key-without-value.patch`, which parses an explicit flow pair without a value (e.g. `{ ? a }`).

Build it with the `tree-sitter-cli` version that matches the pinned `web-tree-sitter` version. The patches change
`grammar.js`, so the parser is generated before it's built:

```sh
 $ git clone https://github.com/tree-sitter-grammars/tree-sitter-yaml && cd tree-sitter-yaml
 $ git checkout a1c4812
 $ git fetch origin pull/35/head:pr35 pull/47/head:pr47
 $ git merge --no-edit pr35 && git merge --no-edit pr47
 $ git apply <apidom>/packages/apidom-parser-adapter-yaml-1-2/src/tree-sitter/lexical-analysis/patches/*.patch
 $ npx tree-sitter-cli@0.27.1 generate
 $ npx tree-sitter-cli@0.27.1 test
 $ npx tree-sitter-cli@0.27.1 build --wasm
 $ cp tree-sitter-yaml.wasm <apidom>/packages/apidom-parser-adapter-yaml-1-2/src/tree-sitter/lexical-analysis/
```

`tree-sitter-cli` downloads the [wasi-sdk](https://github.com/WebAssembly/wasi-sdk) toolchain on first use, so neither Emscripten nor Docker is required.
