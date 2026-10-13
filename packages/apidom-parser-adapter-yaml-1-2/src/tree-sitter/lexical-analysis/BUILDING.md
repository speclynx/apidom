# tree-sitter-yaml.wasm

`tree-sitter-yaml.wasm` is built from [tree-sitter-yaml](https://github.com/tree-sitter-grammars/tree-sitter-yaml)
`master` (`a1c4812`) with [tree-sitter-grammars/tree-sitter-yaml#35](https://github.com/tree-sitter-grammars/tree-sitter-yaml/pull/35) (`8025f83`) merged in,
which supports documents larger than 32,768 lines. Build it with the `tree-sitter-cli` version that matches the pinned `web-tree-sitter` version:

```sh
 $ git clone https://github.com/tree-sitter-grammars/tree-sitter-yaml && cd tree-sitter-yaml
 $ git fetch origin pull/35/head:pr35 && git merge --no-edit pr35
 $ npx tree-sitter-cli@0.27.1 build --wasm
 $ cp tree-sitter-yaml.wasm <apidom>/packages/apidom-parser-adapter-yaml-1-2/src/tree-sitter/lexical-analysis/
```

`tree-sitter-cli` downloads the [wasi-sdk](https://github.com/WebAssembly/wasi-sdk) toolchain on first use, so neither Emscripten nor Docker is required.
