/**
 * TypeScript module declarations for WebAssembly (.wasm) files.
 * This allows importing .wasm files as modules without @ts-ignore.
 */
declare module '*.wasm' {
  const content: string;
  export default content;
}

declare module 'web-tree-sitter/tree-sitter.wasm' {
  const content: string;
  export default content;
}

declare module '@tree-sitter-grammars/tree-sitter-yaml/tree-sitter-yaml.wasm' {
  const content: string;
  export default content;
}
