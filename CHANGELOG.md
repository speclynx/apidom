# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.12.1](https://github.com/speclynx/apidom/compare/v4.12.0...v4.12.1) (2026-06-23)

### Bug Fixes

- **datamodel:** register annotation, comment and parseResult elements ([#356](https://github.com/speclynx/apidom/issues/356)) ([d6609ea](https://github.com/speclynx/apidom/commit/d6609ea2ffa5d550b0e3d528de79f7667fa41f21))
- **playground:** migrate to MUI v9 component APIs ([#357](https://github.com/speclynx/apidom/issues/357)) ([04236ec](https://github.com/speclynx/apidom/commit/04236ecafd796819fefd28a00f2b0254d1a305f3)), closes [#340](https://github.com/speclynx/apidom/issues/340) [#349](https://github.com/speclynx/apidom/issues/349)

### Features

- **playground:** add overlay 1.x parsing support ([#358](https://github.com/speclynx/apidom/issues/358)) ([8157297](https://github.com/speclynx/apidom/commit/8157297ac3547b3c0cbbe9ff7e4d7f525fc6f009)), closes [#235](https://github.com/speclynx/apidom/issues/235)

# [4.12.0](https://github.com/speclynx/apidom/compare/v4.11.1...v4.12.0) (2026-06-23)

### Features

- **reference:** add OpenAPI 3.0 bundle strategy ([#352](https://github.com/speclynx/apidom/issues/352)) ([982860e](https://github.com/speclynx/apidom/commit/982860e6db5c6a122e69b34bfdd02f5f99cbbb9a))

## [4.11.1](https://github.com/speclynx/apidom/compare/v4.11.0...v4.11.1) (2026-06-10)

### Bug Fixes

- **release:** fix failed 4.11.0 release ([2ebb0ba](https://github.com/speclynx/apidom/commit/2ebb0baa7d3455746235a5097a40f1c73e50e83a))

# [4.11.0](https://github.com/speclynx/apidom/compare/v4.10.1...v4.11.0) (2026-06-10)

### Features

- **traverse:** skipVisited 'enter-only' mode and path.revisited ([#333](https://github.com/speclynx/apidom/issues/333)) ([fe944df](https://github.com/speclynx/apidom/commit/fe944df0eaab437a65d5761e6a3e14d490d2d3d6))

## [4.10.1](https://github.com/speclynx/apidom/compare/v4.10.0...v4.10.1) (2026-05-20)

### Features

- **docs:** add Code Wiki badge to main README ([e57e1b1](https://github.com/speclynx/apidom/commit/e57e1b11bc61e66786a3ae0604ffc13532085fd3))

# [4.10.0](https://github.com/speclynx/apidom/compare/v4.9.1...v4.10.0) (2026-05-12)

### Features

- **overlay:** add support for overlay generation by diffing API docs ([#278](https://github.com/speclynx/apidom/issues/278)) ([41fca34](https://github.com/speclynx/apidom/commit/41fca3455bce2e637b1e53f78f3f60afd93ef16c))

## [4.9.1](https://github.com/speclynx/apidom/compare/v4.9.0...v4.9.1) (2026-04-21)

### Bug Fixes

- **ns-overlay-1:** add actions mappings to replaceEmptyElement plugin ([#257](https://github.com/speclynx/apidom/issues/257)) ([3719dc0](https://github.com/speclynx/apidom/commit/3719dc03613c49fc24696dcd7779e0f151a8989f))

# [4.9.0](https://github.com/speclynx/apidom/compare/v4.8.0...v4.9.0) (2026-04-17)

### Features

- **core:** add traverseOptions to dispatchRefractorPlugins ([#248](https://github.com/speclynx/apidom/issues/248)) ([98b5831](https://github.com/speclynx/apidom/commit/98b58319a394eb26975ecefbab0b58eb9d22092b))

# [4.8.0](https://github.com/speclynx/apidom/compare/v4.7.1...v4.8.0) (2026-04-17)

### Bug Fixes

- **reference:** fix circular: 'replace' hanging on large specs ([7b94468](https://github.com/speclynx/apidom/commit/7b9446889e89dab869648a5e9ad9042f5faa00cc))
- **traverse:** change skipVisited default to false ([3e0df19](https://github.com/speclynx/apidom/commit/3e0df196d0bb5878fc18858209cc8ec31c0ab9cb))

### Features

- **traverse:** add skipVisited option to prevent DAG explosion ([a149b2e](https://github.com/speclynx/apidom/commit/a149b2e92024afaf945f52a06ea00a9202519e2b))

## [4.7.1](https://github.com/speclynx/apidom/compare/v4.7.0...v4.7.1) (2026-04-16)

### Bug Fixes

- **reference:** prevent exponential tree growth on deref ([#244](https://github.com/speclynx/apidom/issues/244)) ([2873e2a](https://github.com/speclynx/apidom/commit/2873e2ac8a2489396091b6bdf321138a34398d44)), closes [#12](https://github.com/speclynx/apidom/issues/12)

# [4.7.0](https://github.com/speclynx/apidom/compare/v4.6.0...v4.7.0) (2026-04-12)

### Features

- **overlay:** generic targets, export defaults, scoped opts ([#236](https://github.com/speclynx/apidom/issues/236)) ([7df6dc7](https://github.com/speclynx/apidom/commit/7df6dc79d18e4c71ceb17037a45f9ba069fdcaf1))

# [4.6.0](https://github.com/speclynx/apidom/compare/v4.5.0...v4.6.0) (2026-04-12)

### Features

- **overlay:** add tracing and restructure into realms ([#234](https://github.com/speclynx/apidom/issues/234)) ([3ae47c6](https://github.com/speclynx/apidom/commit/3ae47c6f8916b70db15704ade73af63210813c8c))

# [4.5.0](https://github.com/speclynx/apidom/compare/v4.4.0...v4.5.0) (2026-04-12)

### Features

- **overlay:** add support for POJO ([#233](https://github.com/speclynx/apidom/issues/233)) ([810b8e4](https://github.com/speclynx/apidom/commit/810b8e4b10787f9982e449915fbc0c4d58c65e1d))

# [4.4.0](https://github.com/speclynx/apidom/compare/v4.3.1...v4.4.0) (2026-04-12)

### Features

- **overlay:** add apidom-overlay package ([#231](https://github.com/speclynx/apidom/issues/231)) ([bcd63b9](https://github.com/speclynx/apidom/commit/bcd63b9ce08afceb03bf78d540992fa7ce50d91a))

## [4.3.1](https://github.com/speclynx/apidom/compare/v4.3.0...v4.3.1) (2026-04-08)

### Bug Fixes

- **release:** fix failed v4.3.0 release ([99ca535](https://github.com/speclynx/apidom/commit/99ca535b9992c960697342a6e6ab943aa1fbad66))

# [4.3.0](https://github.com/speclynx/apidom/compare/v4.2.0...v4.3.0) (2026-04-07)

### Features

- add Overlay namespace ([#185](https://github.com/speclynx/apidom/issues/185)) ([8fa9a1e](https://github.com/speclynx/apidom/commit/8fa9a1e3536b2da1a03e8275b00013da051f08da))
- add Overlay parser adapters ([#188](https://github.com/speclynx/apidom/issues/188)) ([49824ff](https://github.com/speclynx/apidom/commit/49824ffe9e41c627ae762c082291e9ca0b159f31))
- **reference:** add Arazzo resolve strategy ([#210](https://github.com/speclynx/apidom/issues/210)) ([28103f5](https://github.com/speclynx/apidom/commit/28103f52d72591b9a185319a4e4b1631cd639407)), closes [#78](https://github.com/speclynx/apidom/issues/78)
- **reference:** add Overlay parsers, derefer and resolve strategies ([#189](https://github.com/speclynx/apidom/issues/189)) ([7e4565b](https://github.com/speclynx/apidom/commit/7e4565b7807b875769857693a912bab807dc9a13))

# [4.2.0](https://github.com/speclynx/apidom/compare/v4.1.0...v4.2.0) (2026-03-17)

### Features

- **ns-openapi-2-0:** add normalization refractor plugins ([#170](https://github.com/speclynx/apidom/issues/170)) ([315b5c6](https://github.com/speclynx/apidom/commit/315b5c620f752941749df13c0a5ab4bd14d41597))
- **ns-openapi-3-0:** add normalization refractor plugins ([#169](https://github.com/speclynx/apidom/issues/169)) ([fb0ec23](https://github.com/speclynx/apidom/commit/fb0ec23dd8c933a9a4d72762f3fb643e3e11d037))

# [4.1.0](https://github.com/speclynx/apidom/compare/v4.0.5...v4.1.0) (2026-03-16)

### Features

- **ns-openapi-3-1:** expose refractor plugins also as reusable functions ([#168](https://github.com/speclynx/apidom/issues/168)) ([ad8c3b0](https://github.com/speclynx/apidom/commit/ad8c3b008881003f4a32ec1a250080a708eb9aa9))

## [4.0.5](https://github.com/speclynx/apidom/compare/v4.0.4...v4.0.5) (2026-03-13)

### Bug Fixes

- **traverse:** path.stop() in merged visitor no longer skips subsequent visitors for current node ([#163](https://github.com/speclynx/apidom/issues/163)) ([51a80af](https://github.com/speclynx/apidom/commit/51a80af99ee786e23829f30f1d5ff393a08a5da1))

## [4.0.4](https://github.com/speclynx/apidom/compare/v4.0.3...v4.0.4) (2026-03-12)

### Bug Fixes

- add consistent JSON Schema element naming ([#156](https://github.com/speclynx/apidom/issues/156)) ([834783e](https://github.com/speclynx/apidom/commit/834783e3bf1de42f07236079d21c54cdbdfd4e3f))
- **release:** override minimatch 10.2.3 to fix glob pattern regression in lerna publish ([#157](https://github.com/speclynx/apidom/issues/157)) ([c2d65a0](https://github.com/speclynx/apidom/commit/c2d65a06a2187e8563a9dc9db74ba27255450e0b)), closes [lerna/lerna#4305](https://github.com/lerna/lerna/issues/4305) [isaacs/minimatch#284](https://github.com/isaacs/minimatch/issues/284)

## [4.0.3](https://github.com/speclynx/apidom/compare/v4.0.2...v4.0.3) (2026-03-11)

### Bug Fixes

- **release:** fix v4.0.2 failed release ([b4dc1c4](https://github.com/speclynx/apidom/commit/b4dc1c48e8d9b2986a70e49b5554eb0a166d7528))

## [4.0.2](https://github.com/speclynx/apidom/compare/v4.0.1...v4.0.2) (2026-03-11)

### Bug Fixes

- **release:** fix v4.0.1 failed release ([32336de](https://github.com/speclynx/apidom/commit/32336ded260c97b1582b4942a0e2f37b4a7c14ea))

## [4.0.1](https://github.com/speclynx/apidom/compare/v4.0.0...v4.0.1) (2026-03-11)

### Bug Fixes

- **release:** fix v4 failed release ([1cb7b4e](https://github.com/speclynx/apidom/commit/1cb7b4e9bcf40815cec1d6936a509bde29e0bec8))

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

### Bug Fixes

- **referece:** fix indirection leak in dereference strategies ([#141](https://github.com/speclynx/apidom/issues/141)) ([57ec415](https://github.com/speclynx/apidom/commit/57ec4153baade728681e43223d058ef35b707212))

### Features

- add keywords to all package.json files for npm search discoverability ([#142](https://github.com/speclynx/apidom/issues/142)) ([f6c2b38](https://github.com/speclynx/apidom/commit/f6c2b387db48427f0f12e3019e1bdb8d7e05dd00))

# [3.1.0](https://github.com/speclynx/apidom/compare/v3.0.0...v3.1.0) (2026-03-08)

### Features

- **reference:** introduce continueOnError option for dereferencing ([#140](https://github.com/speclynx/apidom/issues/140)) ([a4b21fe](https://github.com/speclynx/apidom/commit/a4b21fe1ea7b6330d0f05c8bbbd713a0579b5115))

# [3.0.0](https://github.com/speclynx/apidom/compare/v2.13.1...v3.0.0) (2026-03-05)

### Features

- introduce new memory efficient meta data management ([#129](https://github.com/speclynx/apidom/issues/129)) ([82ae0d7](https://github.com/speclynx/apidom/commit/82ae0d7cc2e9ee7037c3d9681817add2ca18dc92))

### Performance Improvements

- consume generic ApiDOM during semantic refraction ([#132](https://github.com/speclynx/apidom/issues/132)) ([87258b0](https://github.com/speclynx/apidom/commit/87258b01c701120321e12daad0f965910897dae5))
- **ns:** remove unused 'fixed-field' class from FixedFieldsVisitor ([#131](https://github.com/speclynx/apidom/issues/131)) ([604e0e5](https://github.com/speclynx/apidom/commit/604e0e58c959937f402756e7c5ff2528a1ceb9b6))

### BREAKING CHANGES

- meta data use to be elements before, now they are simple primitives

## [2.13.1](https://github.com/speclynx/apidom/compare/v2.13.0...v2.13.1) (2026-02-28)

### Bug Fixes

- **reference:** fix types for cached HTTP resolver ([e862887](https://github.com/speclynx/apidom/commit/e86288710f881bde742da02f04ae28b51076fe98))

# [2.13.0](https://github.com/speclynx/apidom/compare/v2.12.4...v2.13.0) (2026-02-28)

### Features

- **reference:** add cache support for Axios resolver ([#117](https://github.com/speclynx/apidom/issues/117)) ([372c58d](https://github.com/speclynx/apidom/commit/372c58df1649c82092851ac6e0d89e53d8e9bbd8))

## [2.12.4](https://github.com/speclynx/apidom/compare/v2.12.3...v2.12.4) (2026-02-24)

### Bug Fixes

- **parser-adapter-yaml-1-2:** parse document larger than 32768 lines ([#110](https://github.com/speclynx/apidom/issues/110)) ([d745fb8](https://github.com/speclynx/apidom/commit/d745fb85ec5f92790e1aaf8ece23ab54acab2703))

## [2.12.3](https://github.com/speclynx/apidom/compare/v2.12.2...v2.12.3) (2026-02-24)

### Bug Fixes

- **openapi:** use official OpenAPI media type ([#109](https://github.com/speclynx/apidom/issues/109)) ([ce41698](https://github.com/speclynx/apidom/commit/ce416981bc104ebd6150298a365a6f489a480d58))

## [2.12.2](https://github.com/speclynx/apidom/compare/v2.12.1...v2.12.2) (2026-02-20)

### Bug Fixes

- **security:** replace vulnerabe minimatch with picomatch ([#102](https://github.com/speclynx/apidom/issues/102)) ([678e593](https://github.com/speclynx/apidom/commit/678e5938fd15b13655bbd9324306ecfc247c73c1))

## [2.12.1](https://github.com/speclynx/apidom/compare/v2.12.0...v2.12.1) (2026-02-18)

### Bug Fixes

- use exact versions for inter-package dependencies ([112f2d6](https://github.com/speclynx/apidom/commit/112f2d6ad746c41fec472babe8ff155f88f6a8eb))

# [2.12.0](https://github.com/speclynx/apidom/compare/v2.11.0...v2.12.0) (2026-02-18)

### Features

- add support for lossless JSON/YAML roundtrips ([#97](https://github.com/speclynx/apidom/issues/97)) ([dc17c9a](https://github.com/speclynx/apidom/commit/dc17c9a78fbc7df07a91e8f35b12be6409117d91))

# [2.11.0](https://github.com/speclynx/apidom/compare/v2.10.3...v2.11.0) (2026-02-12)

### Features

- **datamodel:** introduce side-effect free element accessors ([#87](https://github.com/speclynx/apidom/issues/87)) ([f93b066](https://github.com/speclynx/apidom/commit/f93b066836f04570fa5781aea176885175a35ef4))

## [2.10.3](https://github.com/speclynx/apidom/compare/v2.10.2...v2.10.3) (2026-02-10)

### Bug Fixes

- **ns-arazzo-1:** remove arazzo class from ArazzoSpecification element ([#84](https://github.com/speclynx/apidom/issues/84)) ([2fc5d6d](https://github.com/speclynx/apidom/commit/2fc5d6d6108db8724352986b02252edd5528d173))

## [2.10.2](https://github.com/speclynx/apidom/compare/v2.10.1...v2.10.2) (2026-02-08)

### Bug Fixes

- **reference:** pin broken arazzo runtime parser to fix version ([f9db9b0](https://github.com/speclynx/apidom/commit/f9db9b020b3753703703acea67629f020a4bc3de))

## [2.10.1](https://github.com/speclynx/apidom/compare/v2.10.0...v2.10.1) (2026-02-08)

### Bug Fixes

- **adapter-json:** supress loading wasm file ([#80](https://github.com/speclynx/apidom/issues/80)) ([2a5aa92](https://github.com/speclynx/apidom/commit/2a5aa927346ea4359fc7f3f395aaf20332c21756))
- **adapter-yaml-1-2:** supress loading wasm file ([#81](https://github.com/speclynx/apidom/issues/81)) ([b05beb8](https://github.com/speclynx/apidom/commit/b05beb8edea8945c9cf41c96430ae5fe2098f9f2))

# [2.10.0](https://github.com/speclynx/apidom/compare/v2.9.0...v2.10.0) (2026-02-08)

### Features

- **reference:** add retrievalURI metadata for Arazzo Source Descriptions ([#79](https://github.com/speclynx/apidom/issues/79)) ([df78cb3](https://github.com/speclynx/apidom/commit/df78cb3226521e6f7097b85cccdbc6b0b39e7a7b))

# [2.9.0](https://github.com/speclynx/apidom/compare/v2.8.0...v2.9.0) (2026-02-08)

### Features

- **reference:** attach parse result as meta to Arazzo source descriptions ([#76](https://github.com/speclynx/apidom/issues/76)) ([448a099](https://github.com/speclynx/apidom/commit/448a099fc6af8189302346efdcc117c95c9b6e3b))
- **reference:** avoid re-resolving Arazzo source descriptions during dereferencing ([#77](https://github.com/speclynx/apidom/issues/77)) ([0ad63e8](https://github.com/speclynx/apidom/commit/0ad63e8d204d991a0de47b486ad391d506eb66dc))
- **reference:** expose low level API for dereferencing Arazzo source descriptions ([#75](https://github.com/speclynx/apidom/issues/75)) ([3b1e343](https://github.com/speclynx/apidom/commit/3b1e343c58ff983201ac0509bf841845bbf7eb83))

# [2.8.0](https://github.com/speclynx/apidom/compare/v2.7.0...v2.8.0) (2026-02-06)

### Features

- **reference:** expose low level API for parsing Arazzo source descriptions ([#73](https://github.com/speclynx/apidom/issues/73)) ([1f0d771](https://github.com/speclynx/apidom/commit/1f0d7713f864924e03c601113c0270aeed6e9f81))

# [2.7.0](https://github.com/speclynx/apidom/compare/v2.6.1...v2.7.0) (2026-02-05)

### Features

- **reference:** add support for Arazzo Source Description dereferencing ([#69](https://github.com/speclynx/apidom/issues/69)) ([87efee9](https://github.com/speclynx/apidom/commit/87efee95b86ab6f947ef908db6225b9bb60d7a40))

## [2.6.1](https://github.com/speclynx/apidom/compare/v2.6.0...v2.6.1) (2026-02-04)

### Bug Fixes

- **reference:** enhance error messages ([#67](https://github.com/speclynx/apidom/issues/67)) ([4d73e5f](https://github.com/speclynx/apidom/commit/4d73e5fd4dbff6bfd222d4ba821c004250e82662))
- **reference:** throw UnmatchedParserError on empty parser match ([#66](https://github.com/speclynx/apidom/issues/66)) ([ce99b42](https://github.com/speclynx/apidom/commit/ce99b421fb8dfc91541ca74aefb06cd3bcfd777c))

# [2.6.0](https://github.com/speclynx/apidom/compare/v2.5.1...v2.6.0) (2026-02-03)

### Features

- **reference:** add support for Arazzo Source Description parsing ([#63](https://github.com/speclynx/apidom/issues/63)) ([6df480a](https://github.com/speclynx/apidom/commit/6df480a10bb72b2207d37e0239d2ef9b73e49d08))
- **reference:** pass options objects to resolve methods ([#64](https://github.com/speclynx/apidom/issues/64)) ([be9ca2d](https://github.com/speclynx/apidom/commit/be9ca2de33ae7a2fa9b677a8521873bcdd6781be))

## [2.5.1](https://github.com/speclynx/apidom/compare/v2.5.0...v2.5.1) (2026-01-31)

### Bug Fixes

- **reference:** make accessing parse result consistent ([#58](https://github.com/speclynx/apidom/issues/58)) ([8789ed7](https://github.com/speclynx/apidom/commit/8789ed77051082036838d2d51ef9f8ae29ae02e4))

# [2.5.0](https://github.com/speclynx/apidom/compare/v2.4.0...v2.5.0) (2026-01-30)

### Features

- **reference:** add initial dereferencing strategy for Arazzo 1.x ([#54](https://github.com/speclynx/apidom/issues/54)) ([3561dbf](https://github.com/speclynx/apidom/commit/3561dbf34c417a9c945129acc529bd5fd825fd65))
- **reference:** add JSON Schema dereferencing for Arazzo ([#56](https://github.com/speclynx/apidom/issues/56)) ([03bbd2c](https://github.com/speclynx/apidom/commit/03bbd2cc6a30a252c7e15d21abb687ba6888a60f))

# [2.4.0](https://github.com/speclynx/apidom/compare/v2.3.0...v2.4.0) (2026-01-29)

### Features

- **core:** use standardized field inspection ([#52](https://github.com/speclynx/apidom/issues/52)) ([cc4506c](https://github.com/speclynx/apidom/commit/cc4506c5cbd4bd03943e271ef93a7ab5574ac978))

# [2.3.0](https://github.com/speclynx/apidom/compare/v2.2.3...v2.3.0) (2026-01-27)

### Features

- support strict parsing mode through out the packages ([#46](https://github.com/speclynx/apidom/issues/46)) ([e6b47d9](https://github.com/speclynx/apidom/commit/e6b47d9cfdede7103cada67362b316fd8e5b787f)), closes [#23](https://github.com/speclynx/apidom/issues/23)

## [2.2.3](https://github.com/speclynx/apidom/compare/v2.2.2...v2.2.3) (2026-01-26)

### Bug Fixes

- fix build artifacts ([4c9caa1](https://github.com/speclynx/apidom/commit/4c9caa14e73facb4c0e034d901c43c1613bb90ba))

## [2.2.2](https://github.com/speclynx/apidom/compare/v2.2.1...v2.2.2) (2026-01-23)

### Bug Fixes

- **core:** utilize proper YAML 1.2 serialization ([#27](https://github.com/speclynx/apidom/issues/27)) ([b5316be](https://github.com/speclynx/apidom/commit/b5316be91be98299cddc71925f95e5224ed46a9d))

## [2.2.1](https://github.com/speclynx/apidom/compare/v2.2.0...v2.2.1) (2026-01-20)

### Bug Fixes

- **traverse:** fix Path.getPathKeys() method ([#26](https://github.com/speclynx/apidom/issues/26)) ([f55014f](https://github.com/speclynx/apidom/commit/f55014fc58e436cfd2b02b371dca4b04b14032be))

# [2.2.0](https://github.com/speclynx/apidom/compare/v2.1.0...v2.2.0) (2026-01-19)

### Features

- **json-path:** integrate @swaggerexpert/jsonpath as JSONPath engine ([#25](https://github.com/speclynx/apidom/issues/25)) ([40f9279](https://github.com/speclynx/apidom/commit/40f92793ab9d2ab82ba5a4431f82c186031b661f))

# [2.1.0](https://github.com/speclynx/apidom/compare/v2.0.1...v2.1.0) (2026-01-17)

### Features

- **traverse:** add path formatting capability - JSON Pointer | JSONPath ([#24](https://github.com/speclynx/apidom/issues/24)) ([8363c1d](https://github.com/speclynx/apidom/commit/8363c1d14a036b6dcc8ebaf03430c2f6d7c70f8d))

## [2.0.1](https://github.com/speclynx/apidom/compare/v2.0.0...v2.0.1) (2026-01-14)

### Bug Fixes

- **traverse:** fix package publishing ([67e28eb](https://github.com/speclynx/apidom/commit/67e28ebfc6c801fa9b7ef949f22082c47460163c))

# [2.0.0](https://github.com/speclynx/apidom/compare/v1.12.2...v2.0.0) (2026-01-14)

### Bug Fixes

- limit source maps memory consuption ([#20](https://github.com/speclynx/apidom/issues/20)) ([4a0574f](https://github.com/speclynx/apidom/commit/4a0574fd6d466be7c33c8a5871baacd384918d22))

### Features

- add support for strict mode in JSON/YAML parser adapters ([#22](https://github.com/speclynx/apidom/issues/22)) ([a9c5f11](https://github.com/speclynx/apidom/commit/a9c5f11e8748135e7ba578b61d2f1807e11d34aa))
- apply innovations learned during last 3 years ([#11](https://github.com/speclynx/apidom/issues/11)) ([cfdbbfc](https://github.com/speclynx/apidom/commit/cfdbbfc2721b0dadc77eeba31dd4e8768c078d22))
- introduce datamodel package ([#10](https://github.com/speclynx/apidom/issues/10)) ([273af6b](https://github.com/speclynx/apidom/commit/273af6b1151cefb92e8ec51d99b35fb24cec3807))
- **traverse:** move traverse operations to apidom-traverse package ([#18](https://github.com/speclynx/apidom/issues/18)) ([36c9d49](https://github.com/speclynx/apidom/commit/36c9d490ceac2ea961e2b23fbbc72df7fb54bbf3))

### BREAKING CHANGES

- source maps have been completely rewritten
- **traverse:** move traverse operations from core to traverse package
- breaking changes introduced to every package public API

## [1.12.2](https://github.com/speclynx/apidom/compare/v1.12.1...v1.12.2) (2025-12-23)

### Features

- **release:** release via trusted publisher configuration ([a3d0dbb](https://github.com/speclynx/apidom/commit/a3d0dbb20f32c5529eae8be3b02023cfa73a66e9))

## [1.12.1](https://github.com/speclynx/apidom/compare/v1.12.0...v1.12.1) (2025-12-23)

### Features

- publish npm package to nmpjs.com ([75cd3d9](https://github.com/speclynx/apidom/commit/75cd3d97b8bccfd42153d3b1de65b29eb8e963ef))

# 1.12.0 (2025-12-23)

### Features

- add initial code ([de9d14d](https://github.com/speclynx/apidom/commit/de9d14de172d884d5b6ad527c390e373ae621972))
- **playground:** add SpecLynx branding ([565ec44](https://github.com/speclynx/apidom/commit/565ec44b8e52ca243a3afd0194bf5492d9f15896))
