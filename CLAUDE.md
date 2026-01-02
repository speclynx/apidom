# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ApiDOM is a TypeScript monorepo that provides a unified structure for describing APIs across different API description languages (OpenAPI, AsyncAPI, JSON Schema, Arazzo, etc.) and serialization formats (JSON, YAML). It allows parsers to produce a single structure that tools can consume regardless of the original format.

## Build & Development Commands

**Prerequisites:** Node.js >=24.10.0, npm >=11.6.1

**Important:** Always run nvm before executing any node/npm/npx commands to ensure the correct Node.js version is used:
```bash
source ~/.nvm/nvm.sh && nvm use
```

```bash
# Install dependencies (required before any other operation)
npm i

# Build all packages (required before running tests)
npm run build

# Build only ES modules (faster for development)
npm run build:es

# Run all tests (must build first)
npm run test

# Lint all packages
npm run lint
npm run lint:fix

# Type checking
npm run typescript:check-types

# Clean build artifacts
npm run clean
```

### Working with Individual Packages

All npm scripts propagate to packages via lerna. To work with a specific package:

```bash
# Run tests for a single package
cd packages/apidom-core && npm test

# Build a single package
cd packages/apidom-ns-openapi-3-1 && npm run build:es
```

**Performance tip:** Set `CPU_CORES` environment variable to match your CPU cores for faster parallel builds:
```bash
export CPU_CORES=8
npm run build
```

## Architecture

### Package Categories

The monorepo contains 38 packages organized into these categories:

1. **Core Infrastructure:**
   - `apidom-datamodel` - Foundational data model primitives (elements, namespace, serialization)
   - `apidom-core` - Base namespace, elements, predicates, traversal, transclusion
   - `apidom-ast` - Abstract Syntax Tree structures
   - `apidom-error` - Error handling utilities

2. **Namespaces (`apidom-ns-*`):** Define semantic elements for each API spec
   - `apidom-ns-openapi-2`, `apidom-ns-openapi-3-0`, `apidom-ns-openapi-3-1`
   - `apidom-ns-asyncapi-2`
   - `apidom-ns-arazzo-1`
   - `apidom-ns-json-schema-draft-4/6/7`, `apidom-ns-json-schema-2019-09/2020-12`

3. **Parser Adapters (`apidom-parser-adapter-*`):** Parse specific formats into ApiDOM
   - Format-specific adapters for JSON/YAML variants of each namespace
   - Base adapters: `apidom-parser-adapter-json`, `apidom-parser-adapter-yaml-1-2`

4. **High-Level APIs:**
   - `apidom-parser` - Unified parsing interface
   - `apidom-reference` - Reference resolution, bundling, dereferencing
   - `apidom-converter` - Convert between spec versions
   - `apidom-json-pointer`, `apidom-json-pointer-relative`, `apidom-json-path`

5. **Tools:**
   - `apidom-playground` - React-based visual demo app

### Key Concepts

**Elements:** Building blocks of ApiDOM. Each element has:
- `element` - Type identifier (e.g., "string", "openApi3_1")
- `content` - The actual value/children
- `meta` - Semantic metadata (title, description)
- `attributes` - Additional data

**Namespaces:** Collections of elements with semantic meaning. Each namespace extends from base or other namespaces.

**Refractors:** Transform generic ApiDOM into semantic ApiDOM (e.g., generic object -> OpenAPI 3.1 Info element).

**Visitors:** Traverse ApiDOM trees. Used for transformations, validation, and analysis.

### Processing Pipeline

```
Input (JSON/YAML string)
    -> Lexical Analysis (tree-sitter CST)
    -> Syntactic Analysis (generic ApiDOM)
    -> Refraction (semantic ApiDOM, e.g., OpenAPI 3.1)
    -> Plugins (optional transformations)
    -> Output
```

### Package Internal Structure

Each package typically contains:
- `src/elements/` - Element class definitions
- `src/refractor/` - Transformation logic from generic to semantic ApiDOM
- `src/predicates.ts` - Type guards for elements
- `src/traversal/` - Visitor implementations
- `src/media-types.ts` - MIME type definitions
- `src/namespace.ts` - Namespace registration
- `test/` - Mocha tests with fixtures

### Build Outputs

Each package produces:
- `*.mjs` - ES modules (in `src/`)
- `*.cjs` - CommonJS modules (in `src/`)
- `dist/` - UMD bundles for browsers
- `types/` - TypeScript declarations

## Testing

Uses Mocha with Chai assertions. Snapshot testing via `mocha-chai-jest-snapshot`.

```bash
# Update snapshots when output changes intentionally
npm run test:update-snapshots
```

## Code Style

- TypeScript with strict mode
- ESLint + Prettier for formatting
- Conventional Commits for commit messages
- Branch naming: `feature/description` or `fix/issue-number-description`

## Dependencies

Key libraries:
- `minim` - Base element implementation
- `ramda`/`ramda-adjunct` - Functional utilities
- `tree-sitter`/`web-tree-sitter` - Lexical analysis
- `ts-mixer` - Mixin support for TypeScript classes
