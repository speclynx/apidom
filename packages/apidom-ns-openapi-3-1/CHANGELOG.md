# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.2.0](https://github.com/speclynx/apidom/compare/v4.1.0...v4.2.0) (2026-03-17)

### Features

- **ns-openapi-2-0:** add normalization refractor plugins ([#170](https://github.com/speclynx/apidom/issues/170)) ([315b5c6](https://github.com/speclynx/apidom/commit/315b5c620f752941749df13c0a5ab4bd14d41597))
- **ns-openapi-3-0:** add normalization refractor plugins ([#169](https://github.com/speclynx/apidom/issues/169)) ([fb0ec23](https://github.com/speclynx/apidom/commit/fb0ec23dd8c933a9a4d72762f3fb643e3e11d037))

# [4.1.0](https://github.com/speclynx/apidom/compare/v4.0.5...v4.1.0) (2026-03-16)

### Features

- **ns-openapi-3-1:** expose refractor plugins also as reusable functions ([#168](https://github.com/speclynx/apidom/issues/168)) ([ad8c3b0](https://github.com/speclynx/apidom/commit/ad8c3b008881003f4a32ec1a250080a708eb9aa9))

## [4.0.5](https://github.com/speclynx/apidom/compare/v4.0.4...v4.0.5) (2026-03-13)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [4.0.4](https://github.com/speclynx/apidom/compare/v4.0.3...v4.0.4) (2026-03-12)

### Bug Fixes

- **release:** override minimatch 10.2.3 to fix glob pattern regression in lerna publish ([#157](https://github.com/speclynx/apidom/issues/157)) ([c2d65a0](https://github.com/speclynx/apidom/commit/c2d65a06a2187e8563a9dc9db74ba27255450e0b)), closes [lerna/lerna#4305](https://github.com/lerna/lerna/issues/4305) [isaacs/minimatch#284](https://github.com/isaacs/minimatch/issues/284)

## [4.0.3](https://github.com/speclynx/apidom/compare/v4.0.2...v4.0.3) (2026-03-11)

### Bug Fixes

- **release:** fix v4.0.2 failed release ([b4dc1c4](https://github.com/speclynx/apidom/commit/b4dc1c48e8d9b2986a70e49b5554eb0a166d7528))

## [4.0.2](https://github.com/speclynx/apidom/compare/v4.0.1...v4.0.2) (2026-03-11)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [4.0.1](https://github.com/speclynx/apidom/compare/v4.0.0...v4.0.1) (2026-03-11)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [4.0.0](https://github.com/speclynx/apidom/compare/v3.2.1...v4.0.0) (2026-03-11)

### Features

- **traverse:** all traverse operations work on Path and not Element ([#153](https://github.com/speclynx/apidom/issues/153)) ([67d244c](https://github.com/speclynx/apidom/commit/67d244cfd3e77f6a9db704cede50ba8e45d10b11))

### BREAKING CHANGES

- **traverse:** This is a breaking change as operation callbacks
  now accept Path instead of Element. By accepting Path, full
  context of traversal is exposed to consumer instead of just Element.

## [3.2.1](https://github.com/speclynx/apidom/compare/v3.2.0...v3.2.1) (2026-03-09)

### Bug Fixes

- fix issues preventing integrating with Language Service ([#143](https://github.com/speclynx/apidom/issues/143)) ([26480d7](https://github.com/speclynx/apidom/commit/26480d7a495fa57da8b39120a73f64ab2d9d61bf))

# [3.2.0](https://github.com/speclynx/apidom/compare/v3.1.0...v3.2.0) (2026-03-08)

### Features

- add keywords to all package.json files for npm search discoverability ([#142](https://github.com/speclynx/apidom/issues/142)) ([f6c2b38](https://github.com/speclynx/apidom/commit/f6c2b387db48427f0f12e3019e1bdb8d7e05dd00))

# [3.1.0](https://github.com/speclynx/apidom/compare/v3.0.0...v3.1.0) (2026-03-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [3.0.0](https://github.com/speclynx/apidom/compare/v2.13.1...v3.0.0) (2026-03-05)

### Features

- introduce new memory efficient meta data management ([#129](https://github.com/speclynx/apidom/issues/129)) ([82ae0d7](https://github.com/speclynx/apidom/commit/82ae0d7cc2e9ee7037c3d9681817add2ca18dc92))

### Performance Improvements

- consume generic ApiDOM during semantic refraction ([#132](https://github.com/speclynx/apidom/issues/132)) ([87258b0](https://github.com/speclynx/apidom/commit/87258b01c701120321e12daad0f965910897dae5))
- **ns:** remove unused 'fixed-field' class from FixedFieldsVisitor ([#131](https://github.com/speclynx/apidom/issues/131)) ([604e0e5](https://github.com/speclynx/apidom/commit/604e0e58c959937f402756e7c5ff2528a1ceb9b6))

### BREAKING CHANGES

- meta data use to be elements before, now they are simple primitives

## [2.13.1](https://github.com/speclynx/apidom/compare/v2.13.0...v2.13.1) (2026-02-28)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.13.0](https://github.com/speclynx/apidom/compare/v2.12.4...v2.13.0) (2026-02-28)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.12.4](https://github.com/speclynx/apidom/compare/v2.12.3...v2.12.4) (2026-02-24)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.12.3](https://github.com/speclynx/apidom/compare/v2.12.2...v2.12.3) (2026-02-24)

### Bug Fixes

- **openapi:** use official OpenAPI media type ([#109](https://github.com/speclynx/apidom/issues/109)) ([ce41698](https://github.com/speclynx/apidom/commit/ce416981bc104ebd6150298a365a6f489a480d58))

## [2.12.2](https://github.com/speclynx/apidom/compare/v2.12.1...v2.12.2) (2026-02-20)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.12.1](https://github.com/speclynx/apidom/compare/v2.12.0...v2.12.1) (2026-02-18)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.12.0](https://github.com/speclynx/apidom/compare/v2.11.0...v2.12.0) (2026-02-18)

### Features

- add support for lossless JSON/YAML roundtrips ([#97](https://github.com/speclynx/apidom/issues/97)) ([dc17c9a](https://github.com/speclynx/apidom/commit/dc17c9a78fbc7df07a91e8f35b12be6409117d91))

# [2.11.0](https://github.com/speclynx/apidom/compare/v2.10.3...v2.11.0) (2026-02-12)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.10.3](https://github.com/speclynx/apidom/compare/v2.10.2...v2.10.3) (2026-02-10)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.10.2](https://github.com/speclynx/apidom/compare/v2.10.1...v2.10.2) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.10.1](https://github.com/speclynx/apidom/compare/v2.10.0...v2.10.1) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.10.0](https://github.com/speclynx/apidom/compare/v2.9.0...v2.10.0) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.9.0](https://github.com/speclynx/apidom/compare/v2.8.0...v2.9.0) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.8.0](https://github.com/speclynx/apidom/compare/v2.7.0...v2.8.0) (2026-02-06)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.7.0](https://github.com/speclynx/apidom/compare/v2.6.1...v2.7.0) (2026-02-05)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.6.1](https://github.com/speclynx/apidom/compare/v2.6.0...v2.6.1) (2026-02-04)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.6.0](https://github.com/speclynx/apidom/compare/v2.5.1...v2.6.0) (2026-02-03)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.5.1](https://github.com/speclynx/apidom/compare/v2.5.0...v2.5.1) (2026-01-31)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.5.0](https://github.com/speclynx/apidom/compare/v2.4.0...v2.5.0) (2026-01-30)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.4.0](https://github.com/speclynx/apidom/compare/v2.3.0...v2.4.0) (2026-01-29)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.3.0](https://github.com/speclynx/apidom/compare/v2.2.3...v2.3.0) (2026-01-27)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.2.3](https://github.com/speclynx/apidom/compare/v2.2.2...v2.2.3) (2026-01-26)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.2.2](https://github.com/speclynx/apidom/compare/v2.2.1...v2.2.2) (2026-01-23)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.2.1](https://github.com/speclynx/apidom/compare/v2.2.0...v2.2.1) (2026-01-20)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.2.0](https://github.com/speclynx/apidom/compare/v2.1.0...v2.2.0) (2026-01-19)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.1.0](https://github.com/speclynx/apidom/compare/v2.0.1...v2.1.0) (2026-01-17)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [2.0.1](https://github.com/speclynx/apidom/compare/v2.0.0...v2.0.1) (2026-01-14)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [2.0.0](https://github.com/speclynx/apidom/compare/v1.12.2...v2.0.0) (2026-01-14)

### Bug Fixes

- limit source maps memory consuption ([#20](https://github.com/speclynx/apidom/issues/20)) ([4a0574f](https://github.com/speclynx/apidom/commit/4a0574fd6d466be7c33c8a5871baacd384918d22))

### Features

- apply innovations learned during last 3 years ([#11](https://github.com/speclynx/apidom/issues/11)) ([cfdbbfc](https://github.com/speclynx/apidom/commit/cfdbbfc2721b0dadc77eeba31dd4e8768c078d22))
- **traverse:** move traverse operations to apidom-traverse package ([#18](https://github.com/speclynx/apidom/issues/18)) ([36c9d49](https://github.com/speclynx/apidom/commit/36c9d490ceac2ea961e2b23fbbc72df7fb54bbf3))

### BREAKING CHANGES

- source maps have been completely rewritten
- **traverse:** move traverse operations from core to traverse package
- breaking changes introduced to every package public API

## [1.12.2](https://github.com/speclynx/apidom/compare/v1.12.1...v1.12.2) (2025-12-23)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [1.12.1](https://github.com/speclynx/apidom/compare/v1.12.0...v1.12.1) (2025-12-23)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# 1.12.0 (2025-12-23)

### Features

- add initial code ([de9d14d](https://github.com/speclynx/apidom/commit/de9d14de172d884d5b6ad527c390e373ae621972))

# [1.11.0](https://github.com/speclynx/apidom/compare/v1.10.0...v1.11.0) (2025-12-17)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.10.0](https://github.com/speclynx/apidom/compare/v1.9.0...v1.10.0) (2025-12-13)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.9.0](https://github.com/speclynx/apidom/compare/v1.8.0...v1.9.0) (2025-09-28)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.8.0](https://github.com/speclynx/apidom/compare/v1.7.1...v1.8.0) (2025-09-27)

### Features

- **ns-openapi-3-1:** add support for OpenAPI 3.1.2 ([#85](https://github.com/speclynx/apidom/issues/85)) ([8ea1767](https://github.com/speclynx/apidom/commit/8ea1767b1be31b1010bd4da839f2150006ec7da6))
- **parser-adapter-openapi-json-3-1:** add support for OpenAPI 3.1.2 ([#86](https://github.com/speclynx/apidom/issues/86)) ([d435999](https://github.com/speclynx/apidom/commit/d435999bdf05dcec3359425b6e23b08c17fe97b7))

## [1.7.1](https://github.com/speclynx/apidom/compare/v1.7.0...v1.7.1) (2025-09-06)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.7.0](https://github.com/speclynx/apidom/compare/v1.6.0...v1.7.0) (2025-09-05)

### Bug Fixes

- fix order of refracting within the mixed fields visitor ([#80](https://github.com/speclynx/apidom/issues/80)) ([3838872](https://github.com/speclynx/apidom/commit/38388725560e3d427e896cd88afd02b6cc77e1ff)), closes [#63](https://github.com/speclynx/apidom/issues/63)

# [1.6.0](https://github.com/speclynx/apidom/compare/v1.5.0...v1.6.0) (2025-09-05)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.5.0](https://github.com/speclynx/apidom/compare/v1.4.2...v1.5.0) (2025-08-31)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [1.4.2](https://github.com/speclynx/apidom/compare/v1.4.1...v1.4.2) (2025-08-30)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [1.4.1](https://github.com/speclynx/apidom/compare/v1.4.0...v1.4.1) (2025-08-26)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.4.0](https://github.com/speclynx/apidom/compare/v1.3.0...v1.4.0) (2025-07-17)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# [1.3.0](https://github.com/speclynx/apidom/compare/v1.2.0...v1.3.0) (2025-07-11)

### Features

- use speclynx as publishing scope ([#65](https://github.com/speclynx/apidom/issues/65)) ([0a9b57e](https://github.com/speclynx/apidom/commit/0a9b57ea52ada33b3b0045814ff5fdcfbb0067aa)), closes [#61](https://github.com/speclynx/apidom/issues/61)

# [1.2.0](https://github.com/speclynx/apidom/compare/v1.1.1...v1.2.0) (2025-06-16)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

## [1.1.1](https://github.com/speclynx/apidom/compare/v1.1.0...v1.1.1) (2025-06-08)

**Note:** Version bump only for package @speclynx/apidom-ns-openapi-3-1

# 1.1.0 (2025-06-06)

### Bug Fixes

- **release:** use proper GitHub release & tag ([7f670b2](https://github.com/speclynx/apidom/commit/7f670b2f91080f639c7bb4d60954ec4aea8f91c8))

### Features

- change package naming ([#11](https://github.com/speclynx/apidom/issues/11)) ([a7e71af](https://github.com/speclynx/apidom/commit/a7e71afd48f14311e02d93b0881cf634cb342beb))
