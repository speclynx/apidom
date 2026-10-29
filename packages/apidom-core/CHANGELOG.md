# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.1.1](https://github.com/speclynx/apidom/compare/v6.1.0...v6.1.1) (2026-10-29)

### Bug Fixes

- parse empty YAML values as null elements ([#712](https://github.com/speclynx/apidom/issues/712)) ([388e842](https://github.com/speclynx/apidom/commit/388e842f3156fc94f46724f507cbf0dd92acae06)), closes [#655](https://github.com/speclynx/apidom/issues/655) [#709](https://github.com/speclynx/apidom/issues/709) [#694](https://github.com/speclynx/apidom/issues/694)
- serialize empty YAML mapping keys to the empty string ([#709](https://github.com/speclynx/apidom/issues/709)) ([3ecce30](https://github.com/speclynx/apidom/commit/3ecce3025b89e5bcdb1481525fe35a86685285f9)), closes [#655](https://github.com/speclynx/apidom/issues/655) [#694](https://github.com/speclynx/apidom/issues/694)

# [6.1.0](https://github.com/speclynx/apidom/compare/v6.0.6...v6.1.0) (2026-10-17)

### Bug Fixes

- **core:** apply sortMapEntries when writing YAML with preserveStyle ([fcea217](https://github.com/speclynx/apidom/commit/fcea2177be8f26c58d01e4e616ad00c0d62f6149)), closes [#671](https://github.com/speclynx/apidom/issues/671)
- **core:** keep element style when merging with deepmerge ([#679](https://github.com/speclynx/apidom/issues/679)) ([8b6c334](https://github.com/speclynx/apidom/commit/8b6c334e92770999e341b9229cdfc8f502f8c8c1)), closes [#678](https://github.com/speclynx/apidom/issues/678)
- **core:** keep object members with non-string scalar keys ([#653](https://github.com/speclynx/apidom/issues/653)) ([c897e45](https://github.com/speclynx/apidom/commit/c897e45e3fda9c55d4c6911cc13ace7f60397ac7)), closes [ObjectElement#toValue](https://github.com/ObjectElement/issues/toValue) [#650](https://github.com/speclynx/apidom/issues/650)
- **core:** write empty YAML nodes back empty with preserveStyle ([#637](https://github.com/speclynx/apidom/issues/637)) ([c668e7e](https://github.com/speclynx/apidom/commit/c668e7e85c8b39730d56128386c7130e85cfaf46)), closes [#631](https://github.com/speclynx/apidom/issues/631)
- **core:** write YAML block indentation indicator of mapping entries ([#672](https://github.com/speclynx/apidom/issues/672)) ([26f151c](https://github.com/speclynx/apidom/commit/26f151ce936c4de0dd53c7251d61a603d053b12a)), closes [#664](https://github.com/speclynx/apidom/issues/664)
- keep comments after YAML root node with preserveStyle ([#659](https://github.com/speclynx/apidom/issues/659)) ([6fe814a](https://github.com/speclynx/apidom/commit/6fe814ae430f7f82571f00bcad4720be61713ec0)), closes [#645](https://github.com/speclynx/apidom/issues/645)
- parse and write back YAML single pair in flow sequence ([#654](https://github.com/speclynx/apidom/issues/654)) ([6ae5239](https://github.com/speclynx/apidom/commit/6ae523923c9f5d049ec4d7b90969c5c5802fc8be)), closes [#644](https://github.com/speclynx/apidom/issues/644)
- serialize empty YAML nodes to null ([#655](https://github.com/speclynx/apidom/issues/655)) ([da2365b](https://github.com/speclynx/apidom/commit/da2365b0fd3287756746837cea40ab986b9d1d1d)), closes [#631](https://github.com/speclynx/apidom/issues/631)

### Features

- write explicit YAML tags back with preserveStyle ([#642](https://github.com/speclynx/apidom/issues/642)) ([ae46306](https://github.com/speclynx/apidom/commit/ae46306e19800a71e977a66098b993f2bd0a33c8)), closes [#639](https://github.com/speclynx/apidom/issues/639)
- write YAML aliases back with preserveStyle ([#669](https://github.com/speclynx/apidom/issues/669)) ([57647fd](https://github.com/speclynx/apidom/commit/57647fd3bd28a300eb8bfd6ebcc6bda221295c05)), closes [#668](https://github.com/speclynx/apidom/issues/668)
- write YAML anchors back with preserveStyle ([#658](https://github.com/speclynx/apidom/issues/658)) ([de92e14](https://github.com/speclynx/apidom/commit/de92e14d927feed1bf727d572c13f90db4396925)), closes [#639](https://github.com/speclynx/apidom/issues/639)
- write YAML block scalars back as written with preserveStyle ([#661](https://github.com/speclynx/apidom/issues/661)) ([3bdee7a](https://github.com/speclynx/apidom/commit/3bdee7ae6a6dd0592a03135f2a7d39d02a8f27d1)), closes [#568](https://github.com/speclynx/apidom/issues/568)
- write YAML compact block sequences back with preserveStyle ([#666](https://github.com/speclynx/apidom/issues/666)) ([00e5bfd](https://github.com/speclynx/apidom/commit/00e5bfd450db79bb86fb5ceef61f006394b91368)), closes [#662](https://github.com/speclynx/apidom/issues/662)
- write YAML CRLF line breaks back with preserveStyle ([#676](https://github.com/speclynx/apidom/issues/676)) ([6d995fa](https://github.com/speclynx/apidom/commit/6d995fa258fac80845ab79be7d0d320ff808361b)), closes [#674](https://github.com/speclynx/apidom/issues/674)
- write YAML flow scalars back as written with preserveStyle ([#667](https://github.com/speclynx/apidom/issues/667)) ([4fb2af3](https://github.com/speclynx/apidom/commit/4fb2af3ac3d918bd563e74bdd78c399a9a84fa76)), closes [#663](https://github.com/speclynx/apidom/issues/663)

## [6.0.6](https://github.com/speclynx/apidom/compare/v6.0.5...v6.0.6) (2026-10-15)

### Bug Fixes

- **release:** pass sigstore timeout as a number via publishConfig ([#603](https://github.com/speclynx/apidom/issues/603)) ([3bb44d9](https://github.com/speclynx/apidom/commit/3bb44d9a924741a1f8bbbccebae9b6a2a7cd557b)), closes [#602](https://github.com/speclynx/apidom/issues/602) [#602](https://github.com/speclynx/apidom/issues/602)

## [6.0.5](https://github.com/speclynx/apidom/compare/v6.0.4...v6.0.5) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [6.0.4](https://github.com/speclynx/apidom/compare/v6.0.3...v6.0.4) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [6.0.3](https://github.com/speclynx/apidom/compare/v6.0.2...v6.0.3) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [6.0.2](https://github.com/speclynx/apidom/compare/v6.0.1...v6.0.2) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [6.0.1](https://github.com/speclynx/apidom/compare/v6.0.0...v6.0.1) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

# [6.0.0](https://github.com/speclynx/apidom/compare/v5.2.7...v6.0.0) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.7](https://github.com/speclynx/apidom/compare/v5.2.6...v5.2.7) (2026-10-13)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.6](https://github.com/speclynx/apidom/compare/v5.2.5...v5.2.6) (2026-09-19)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.5](https://github.com/speclynx/apidom/compare/v5.2.4...v5.2.5) (2026-09-17)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.4](https://github.com/speclynx/apidom/compare/v5.2.3...v5.2.4) (2026-09-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.3](https://github.com/speclynx/apidom/compare/v5.2.2...v5.2.3) (2026-09-15)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.2](https://github.com/speclynx/apidom/compare/v5.2.1...v5.2.2) (2026-09-03)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.2.1](https://github.com/speclynx/apidom/compare/v5.2.0...v5.2.1) (2026-08-29)

**Note:** Version bump only for package @speclynx/apidom-core

# [5.2.0](https://github.com/speclynx/apidom/compare/v5.1.1...v5.2.0) (2026-08-29)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.1.1](https://github.com/speclynx/apidom/compare/v5.1.0...v5.1.1) (2026-08-19)

### Bug Fixes

- **core:** alias cycles as recursive anchors when aliasing ([739341a](https://github.com/speclynx/apidom/commit/739341aacd8a11925f5efca505baa53b52fac152)), closes [#459](https://github.com/speclynx/apidom/issues/459)
- **core:** honour aliasDuplicateObjects when preserving style ([8e05d32](https://github.com/speclynx/apidom/commit/8e05d32c236a9515167417ba6921ee307b86cbc2)), closes [#459](https://github.com/speclynx/apidom/issues/459)
- **core:** keep "**proto**" key when building POJOs ([696f49b](https://github.com/speclynx/apidom/commit/696f49b3f704ecb3f29c4218b4b311bbe501a155))
- **core:** make JSON raw number sentinels unforgeable ([#463](https://github.com/speclynx/apidom/issues/463)) ([cdfa493](https://github.com/speclynx/apidom/commit/cdfa493f24248c8d29a30fb91f8b2cbd8a16ee28)), closes [#461](https://github.com/speclynx/apidom/issues/461) [#462](https://github.com/speclynx/apidom/issues/462) [pre-#462](https://github.com/pre-/issues/462) [#459](https://github.com/speclynx/apidom/issues/459)
- **core:** scope serializer cycle detection to ancestors ([#461](https://github.com/speclynx/apidom/issues/461)) ([8f48c50](https://github.com/speclynx/apidom/commit/8f48c50d31e8cc57c0961788d78879478b4fc761)), closes [#459](https://github.com/speclynx/apidom/issues/459)
- **core:** terminate on cycles in the default serializer paths ([5514f4f](https://github.com/speclynx/apidom/commit/5514f4fa2b02c380fd73dcf3db8f453c084a4edf)), closes [#459](https://github.com/speclynx/apidom/issues/459) [#465](https://github.com/speclynx/apidom/issues/465)

### Performance Improvements

- **core:** replace JSON sentinels in a single pass ([#462](https://github.com/speclynx/apidom/issues/462)) ([f6cb922](https://github.com/speclynx/apidom/commit/f6cb9221a73c3e70493ffbda97c12036a11d0a96)), closes [#459](https://github.com/speclynx/apidom/issues/459)

# [5.1.0](https://github.com/speclynx/apidom/compare/v5.0.2...v5.1.0) (2026-08-09)

### Bug Fixes

- **yaml:** make YAML style round-trips byte-perfect (comments, raw numbers) ([#441](https://github.com/speclynx/apidom/issues/441)) ([43dc5b6](https://github.com/speclynx/apidom/commit/43dc5b6a19bfe6268f0ecaedf8f099b1990a363d))

### Features

- **datamodel:** support Metadata in cloneDeep and cloneShallow ([#443](https://github.com/speclynx/apidom/issues/443)) ([8e7e27a](https://github.com/speclynx/apidom/commit/8e7e27a7b01223bba13e54c9703a0c1da34a47d6)), closes [cloneDeep/#cloneShallow](https://github.com/speclynx/apidom/issues/cloneShallow)

## [5.0.2](https://github.com/speclynx/apidom/compare/v5.0.1...v5.0.2) (2026-08-04)

**Note:** Version bump only for package @speclynx/apidom-core

## [5.0.1](https://github.com/speclynx/apidom/compare/v5.0.0...v5.0.1) (2026-07-07)

**Note:** Version bump only for package @speclynx/apidom-core

# [5.0.0](https://github.com/speclynx/apidom/compare/v4.16.0...v5.0.0) (2026-07-07)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.16.0](https://github.com/speclynx/apidom/compare/v4.15.0...v4.16.0) (2026-06-24)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.15.0](https://github.com/speclynx/apidom/compare/v4.14.0...v4.15.0) (2026-06-24)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.14.0](https://github.com/speclynx/apidom/compare/v4.13.0...v4.14.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.13.0](https://github.com/speclynx/apidom/compare/v4.12.1...v4.13.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.12.1](https://github.com/speclynx/apidom/compare/v4.12.0...v4.12.1) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.12.0](https://github.com/speclynx/apidom/compare/v4.11.1...v4.12.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.11.1](https://github.com/speclynx/apidom/compare/v4.11.0...v4.11.1) (2026-06-10)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.11.0](https://github.com/speclynx/apidom/compare/v4.10.1...v4.11.0) (2026-06-10)

### Features

- **traverse:** skipVisited 'enter-only' mode and path.revisited ([#333](https://github.com/speclynx/apidom/issues/333)) ([fe944df](https://github.com/speclynx/apidom/commit/fe944df0eaab437a65d5761e6a3e14d490d2d3d6))

## [4.10.1](https://github.com/speclynx/apidom/compare/v4.10.0...v4.10.1) (2026-05-20)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.10.0](https://github.com/speclynx/apidom/compare/v4.9.1...v4.10.0) (2026-05-12)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.9.1](https://github.com/speclynx/apidom/compare/v4.9.0...v4.9.1) (2026-04-21)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.9.0](https://github.com/speclynx/apidom/compare/v4.8.0...v4.9.0) (2026-04-17)

### Features

- **core:** add traverseOptions to dispatchRefractorPlugins ([#248](https://github.com/speclynx/apidom/issues/248)) ([98b5831](https://github.com/speclynx/apidom/commit/98b58319a394eb26975ecefbab0b58eb9d22092b))

# [4.8.0](https://github.com/speclynx/apidom/compare/v4.7.1...v4.8.0) (2026-04-17)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.7.1](https://github.com/speclynx/apidom/compare/v4.7.0...v4.7.1) (2026-04-16)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.7.0](https://github.com/speclynx/apidom/compare/v4.6.0...v4.7.0) (2026-04-12)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.6.0](https://github.com/speclynx/apidom/compare/v4.5.0...v4.6.0) (2026-04-12)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.5.0](https://github.com/speclynx/apidom/compare/v4.4.0...v4.5.0) (2026-04-12)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.4.0](https://github.com/speclynx/apidom/compare/v4.3.1...v4.4.0) (2026-04-12)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.3.1](https://github.com/speclynx/apidom/compare/v4.3.0...v4.3.1) (2026-04-08)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.3.0](https://github.com/speclynx/apidom/compare/v4.2.0...v4.3.0) (2026-04-07)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.2.0](https://github.com/speclynx/apidom/compare/v4.1.0...v4.2.0) (2026-03-17)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.1.0](https://github.com/speclynx/apidom/compare/v4.0.5...v4.1.0) (2026-03-16)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.0.5](https://github.com/speclynx/apidom/compare/v4.0.4...v4.0.5) (2026-03-13)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.0.4](https://github.com/speclynx/apidom/compare/v4.0.3...v4.0.4) (2026-03-12)

### Bug Fixes

- **release:** override minimatch 10.2.3 to fix glob pattern regression in lerna publish ([#157](https://github.com/speclynx/apidom/issues/157)) ([c2d65a0](https://github.com/speclynx/apidom/commit/c2d65a06a2187e8563a9dc9db74ba27255450e0b)), closes [lerna/lerna#4305](https://github.com/lerna/lerna/issues/4305) [isaacs/minimatch#284](https://github.com/isaacs/minimatch/issues/284)

## [4.0.3](https://github.com/speclynx/apidom/compare/v4.0.2...v4.0.3) (2026-03-11)

### Bug Fixes

- **release:** fix v4.0.2 failed release ([b4dc1c4](https://github.com/speclynx/apidom/commit/b4dc1c48e8d9b2986a70e49b5554eb0a166d7528))

## [4.0.2](https://github.com/speclynx/apidom/compare/v4.0.1...v4.0.2) (2026-03-11)

**Note:** Version bump only for package @speclynx/apidom-core

## [4.0.1](https://github.com/speclynx/apidom/compare/v4.0.0...v4.0.1) (2026-03-11)

**Note:** Version bump only for package @speclynx/apidom-core

# [4.0.0](https://github.com/speclynx/apidom/compare/v3.2.1...v4.0.0) (2026-03-11)

**Note:** Version bump only for package @speclynx/apidom-core

## [3.2.1](https://github.com/speclynx/apidom/compare/v3.2.0...v3.2.1) (2026-03-09)

**Note:** Version bump only for package @speclynx/apidom-core

# [3.2.0](https://github.com/speclynx/apidom/compare/v3.1.0...v3.2.0) (2026-03-08)

### Features

- add keywords to all package.json files for npm search discoverability ([#142](https://github.com/speclynx/apidom/issues/142)) ([f6c2b38](https://github.com/speclynx/apidom/commit/f6c2b387db48427f0f12e3019e1bdb8d7e05dd00))

# [3.1.0](https://github.com/speclynx/apidom/compare/v3.0.0...v3.1.0) (2026-03-08)

**Note:** Version bump only for package @speclynx/apidom-core

# [3.0.0](https://github.com/speclynx/apidom/compare/v2.13.1...v3.0.0) (2026-03-05)

### Features

- introduce new memory efficient meta data management ([#129](https://github.com/speclynx/apidom/issues/129)) ([82ae0d7](https://github.com/speclynx/apidom/commit/82ae0d7cc2e9ee7037c3d9681817add2ca18dc92))

### BREAKING CHANGES

- meta data use to be elements before, now they are simple primitives

## [2.13.1](https://github.com/speclynx/apidom/compare/v2.13.0...v2.13.1) (2026-02-28)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.13.0](https://github.com/speclynx/apidom/compare/v2.12.4...v2.13.0) (2026-02-28)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.12.4](https://github.com/speclynx/apidom/compare/v2.12.3...v2.12.4) (2026-02-24)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.12.3](https://github.com/speclynx/apidom/compare/v2.12.2...v2.12.3) (2026-02-24)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.12.2](https://github.com/speclynx/apidom/compare/v2.12.1...v2.12.2) (2026-02-20)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.12.1](https://github.com/speclynx/apidom/compare/v2.12.0...v2.12.1) (2026-02-18)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.12.0](https://github.com/speclynx/apidom/compare/v2.11.0...v2.12.0) (2026-02-18)

### Features

- add support for lossless JSON/YAML roundtrips ([#97](https://github.com/speclynx/apidom/issues/97)) ([dc17c9a](https://github.com/speclynx/apidom/commit/dc17c9a78fbc7df07a91e8f35b12be6409117d91))

# [2.11.0](https://github.com/speclynx/apidom/compare/v2.10.3...v2.11.0) (2026-02-12)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.10.3](https://github.com/speclynx/apidom/compare/v2.10.2...v2.10.3) (2026-02-10)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.10.2](https://github.com/speclynx/apidom/compare/v2.10.1...v2.10.2) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.10.1](https://github.com/speclynx/apidom/compare/v2.10.0...v2.10.1) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.10.0](https://github.com/speclynx/apidom/compare/v2.9.0...v2.10.0) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.9.0](https://github.com/speclynx/apidom/compare/v2.8.0...v2.9.0) (2026-02-08)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.8.0](https://github.com/speclynx/apidom/compare/v2.7.0...v2.8.0) (2026-02-06)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.7.0](https://github.com/speclynx/apidom/compare/v2.6.1...v2.7.0) (2026-02-05)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.6.1](https://github.com/speclynx/apidom/compare/v2.6.0...v2.6.1) (2026-02-04)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.6.0](https://github.com/speclynx/apidom/compare/v2.5.1...v2.6.0) (2026-02-03)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.5.1](https://github.com/speclynx/apidom/compare/v2.5.0...v2.5.1) (2026-01-31)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.5.0](https://github.com/speclynx/apidom/compare/v2.4.0...v2.5.0) (2026-01-30)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.4.0](https://github.com/speclynx/apidom/compare/v2.3.0...v2.4.0) (2026-01-29)

### Features

- **core:** use standardized field inspection ([#52](https://github.com/speclynx/apidom/issues/52)) ([cc4506c](https://github.com/speclynx/apidom/commit/cc4506c5cbd4bd03943e271ef93a7ab5574ac978))

# [2.3.0](https://github.com/speclynx/apidom/compare/v2.2.3...v2.3.0) (2026-01-27)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.2.3](https://github.com/speclynx/apidom/compare/v2.2.2...v2.2.3) (2026-01-26)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.2.2](https://github.com/speclynx/apidom/compare/v2.2.1...v2.2.2) (2026-01-23)

### Bug Fixes

- **core:** utilize proper YAML 1.2 serialization ([#27](https://github.com/speclynx/apidom/issues/27)) ([b5316be](https://github.com/speclynx/apidom/commit/b5316be91be98299cddc71925f95e5224ed46a9d))

## [2.2.1](https://github.com/speclynx/apidom/compare/v2.2.0...v2.2.1) (2026-01-20)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.2.0](https://github.com/speclynx/apidom/compare/v2.1.0...v2.2.0) (2026-01-19)

**Note:** Version bump only for package @speclynx/apidom-core

# [2.1.0](https://github.com/speclynx/apidom/compare/v2.0.1...v2.1.0) (2026-01-17)

**Note:** Version bump only for package @speclynx/apidom-core

## [2.0.1](https://github.com/speclynx/apidom/compare/v2.0.0...v2.0.1) (2026-01-14)

**Note:** Version bump only for package @speclynx/apidom-core

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

**Note:** Version bump only for package @speclynx/apidom-core

## [1.12.1](https://github.com/speclynx/apidom/compare/v1.12.0...v1.12.1) (2025-12-23)

**Note:** Version bump only for package @speclynx/apidom-core

# 1.12.0 (2025-12-23)

### Features

- add initial code ([de9d14d](https://github.com/speclynx/apidom/commit/de9d14de172d884d5b6ad527c390e373ae621972))

# [1.11.0](https://github.com/speclynx/apidom/compare/v1.10.0...v1.11.0) (2025-12-17)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.10.0](https://github.com/speclynx/apidom/compare/v1.9.0...v1.10.0) (2025-12-13)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.9.0](https://github.com/speclynx/apidom/compare/v1.8.0...v1.9.0) (2025-09-28)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.8.0](https://github.com/speclynx/apidom/compare/v1.7.1...v1.8.0) (2025-09-27)

**Note:** Version bump only for package @speclynx/apidom-core

## [1.7.1](https://github.com/speclynx/apidom/compare/v1.7.0...v1.7.1) (2025-09-06)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.7.0](https://github.com/speclynx/apidom/compare/v1.6.0...v1.7.0) (2025-09-05)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.6.0](https://github.com/speclynx/apidom/compare/v1.5.0...v1.6.0) (2025-09-05)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.5.0](https://github.com/speclynx/apidom/compare/v1.4.2...v1.5.0) (2025-08-31)

**Note:** Version bump only for package @speclynx/apidom-core

## [1.4.2](https://github.com/speclynx/apidom/compare/v1.4.1...v1.4.2) (2025-08-30)

**Note:** Version bump only for package @speclynx/apidom-core

## [1.4.1](https://github.com/speclynx/apidom/compare/v1.4.0...v1.4.1) (2025-08-26)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.4.0](https://github.com/speclynx/apidom/compare/v1.3.0...v1.4.0) (2025-07-17)

**Note:** Version bump only for package @speclynx/apidom-core

# [1.3.0](https://github.com/speclynx/apidom/compare/v1.2.0...v1.3.0) (2025-07-11)

### Features

- use speclynx as publishing scope ([#65](https://github.com/speclynx/apidom/issues/65)) ([0a9b57e](https://github.com/speclynx/apidom/commit/0a9b57ea52ada33b3b0045814ff5fdcfbb0067aa)), closes [#61](https://github.com/speclynx/apidom/issues/61)

# [1.2.0](https://github.com/speclynx/apidom/compare/v1.1.1...v1.2.0) (2025-06-16)

**Note:** Version bump only for package @speclynx/apidom-core

## [1.1.1](https://github.com/speclynx/apidom/compare/v1.1.0...v1.1.1) (2025-06-08)

**Note:** Version bump only for package @speclynx/apidom-core

# 1.1.0 (2025-06-06)

### Bug Fixes

- **release:** use proper GitHub release & tag ([7f670b2](https://github.com/speclynx/apidom/commit/7f670b2f91080f639c7bb4d60954ec4aea8f91c8))

### Features

- change package naming ([#11](https://github.com/speclynx/apidom/issues/11)) ([a7e71af](https://github.com/speclynx/apidom/commit/a7e71afd48f14311e02d93b0881cf634cb342beb))
