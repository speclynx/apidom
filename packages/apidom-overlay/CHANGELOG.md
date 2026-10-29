# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.1.1](https://github.com/speclynx/apidom/compare/v6.1.0...v6.1.1) (2026-10-29)

### Bug Fixes

- **overlay:** reject overlay versions below 1.1.0 in diff ([#707](https://github.com/speclynx/apidom/issues/707)) ([c9b3a08](https://github.com/speclynx/apidom/commit/c9b3a085600fdbb8e8bacbd5a18b80ab443338b2)), closes [#606](https://github.com/speclynx/apidom/issues/606)
- parse empty YAML values as null elements ([#712](https://github.com/speclynx/apidom/issues/712)) ([388e842](https://github.com/speclynx/apidom/commit/388e842f3156fc94f46724f507cbf0dd92acae06)), closes [#655](https://github.com/speclynx/apidom/issues/655) [#709](https://github.com/speclynx/apidom/issues/709) [#694](https://github.com/speclynx/apidom/issues/694)

# [6.1.0](https://github.com/speclynx/apidom/compare/v6.0.6...v6.1.0) (2026-10-17)

### Bug Fixes

- **core:** keep element style when merging with deepmerge ([#679](https://github.com/speclynx/apidom/issues/679)) ([8b6c334](https://github.com/speclynx/apidom/commit/8b6c334e92770999e341b9229cdfc8f502f8c8c1)), closes [#678](https://github.com/speclynx/apidom/issues/678)
- **overlay:** keep YAML style of values added by an overlay ([#677](https://github.com/speclynx/apidom/issues/677)) ([ca38f38](https://github.com/speclynx/apidom/commit/ca38f388ae8505330d84cc6034faf9ffa03835b2)), closes [#675](https://github.com/speclynx/apidom/issues/675)
- serialize empty YAML nodes to null ([#655](https://github.com/speclynx/apidom/issues/655)) ([da2365b](https://github.com/speclynx/apidom/commit/da2365b0fd3287756746837cea40ab986b9d1d1d)), closes [#631](https://github.com/speclynx/apidom/issues/631)

## [6.0.6](https://github.com/speclynx/apidom/compare/v6.0.5...v6.0.6) (2026-10-15)

### Bug Fixes

- **release:** pass sigstore timeout as a number via publishConfig ([#603](https://github.com/speclynx/apidom/issues/603)) ([3bb44d9](https://github.com/speclynx/apidom/commit/3bb44d9a924741a1f8bbbccebae9b6a2a7cd557b)), closes [#602](https://github.com/speclynx/apidom/issues/602) [#602](https://github.com/speclynx/apidom/issues/602)

## [6.0.5](https://github.com/speclynx/apidom/compare/v6.0.4...v6.0.5) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [6.0.4](https://github.com/speclynx/apidom/compare/v6.0.3...v6.0.4) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [6.0.3](https://github.com/speclynx/apidom/compare/v6.0.2...v6.0.3) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [6.0.2](https://github.com/speclynx/apidom/compare/v6.0.1...v6.0.2) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [6.0.1](https://github.com/speclynx/apidom/compare/v6.0.0...v6.0.1) (2026-10-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [6.0.0](https://github.com/speclynx/apidom/compare/v5.2.7...v6.0.0) (2026-10-15)

### Bug Fixes

- **overlay:** guard apply against reference options ([90a51c0](https://github.com/speclynx/apidom/commit/90a51c0d55b1446bab68d1b3cae07b2f352711b6))
- **overlay:** normalize overlay URI used for dereferencing ([627fc01](https://github.com/speclynx/apidom/commit/627fc0177749dbcdccb3df2877f85c5f3770cc94))
- **overlay:** trace unresolvable reusable action references ([28f66b6](https://github.com/speclynx/apidom/commit/28f66b63b185c65056f3dd0647721685b8fa5fa3))

### Features

- **overlay:** apply reusable action references ([3518793](https://github.com/speclynx/apidom/commit/35187935737810b65e7f15c0422a20bd409add91))
- **overlay:** dereference overlays before applying them ([ad0b84b](https://github.com/speclynx/apidom/commit/ad0b84b4c0121403d8156a3f8521ccb4cf87bc44))
- **overlay:** emit Overlay 1.2.0 from diff by default ([56fd656](https://github.com/speclynx/apidom/commit/56fd656fd4f3da97826d6be4dd534bdc29363f97))

### BREAKING CHANGES

- **overlay:** applyOverlayApiDOM and applyOverlayPOJO now return a
  Promise. Await their results. The new `reference` option configures
  dereferencing of the overlay.

## [5.2.7](https://github.com/speclynx/apidom/compare/v5.2.6...v5.2.7) (2026-10-13)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.6](https://github.com/speclynx/apidom/compare/v5.2.5...v5.2.6) (2026-09-19)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.5](https://github.com/speclynx/apidom/compare/v5.2.4...v5.2.5) (2026-09-17)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.4](https://github.com/speclynx/apidom/compare/v5.2.3...v5.2.4) (2026-09-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.3](https://github.com/speclynx/apidom/compare/v5.2.2...v5.2.3) (2026-09-15)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.2](https://github.com/speclynx/apidom/compare/v5.2.1...v5.2.2) (2026-09-03)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.2.1](https://github.com/speclynx/apidom/compare/v5.2.0...v5.2.1) (2026-08-29)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [5.2.0](https://github.com/speclynx/apidom/compare/v5.1.1...v5.2.0) (2026-08-29)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.1.1](https://github.com/speclynx/apidom/compare/v5.1.0...v5.1.1) (2026-08-19)

### Bug Fixes

- **overlay:** apply root-target updates in place ([da41593](https://github.com/speclynx/apidom/commit/da4159322ba53af8595628ae74e11285c8272915)), closes [#471](https://github.com/speclynx/apidom/issues/471)
- **overlay:** clone the parse result under immutable apply ([203d2b5](https://github.com/speclynx/apidom/commit/203d2b53323d9b6d9a77e6b180de005600b067e6)), closes [#475](https://github.com/speclynx/apidom/issues/475)
- **overlay:** clone update value per matched target ([cb98f2b](https://github.com/speclynx/apidom/commit/cb98f2b68a6b1a0831b608f7734895a164b97f0b)), closes [#460](https://github.com/speclynx/apidom/issues/460)
- **overlay:** clone update values emitted by diff ([31b8db9](https://github.com/speclynx/apidom/commit/31b8db9205636a2c79c27a64e57c5da4ba9a14fb)), closes [#469](https://github.com/speclynx/apidom/issues/469)
- **overlay:** honour the immutable default for partial options ([5730aed](https://github.com/speclynx/apidom/commit/5730aedd7c21b256dc41e8f408a36fbf4f09d01a))
- **overlay:** restore the result marker after a root replacement ([#482](https://github.com/speclynx/apidom/issues/482)) ([9227cfc](https://github.com/speclynx/apidom/commit/9227cfc5a287b1d63afb704df4906d41c4984d99)), closes [#481](https://github.com/speclynx/apidom/issues/481)
- **overlay:** return an independent tree from no-op apply ([eb545b8](https://github.com/speclynx/apidom/commit/eb545b8eb53214102d2cbe3975efead1974e6bd5)), closes [#470](https://github.com/speclynx/apidom/issues/470)
- **overlay:** snapshot copy source before updating targets ([bb6ee06](https://github.com/speclynx/apidom/commit/bb6ee06937a6fa296eb6e29dcab1cf6e5c1f9106)), closes [#470](https://github.com/speclynx/apidom/issues/470)

### Performance Improvements

- **overlay:** skip the throwaway clone in the POJO realm ([07c5a81](https://github.com/speclynx/apidom/commit/07c5a818d874f4d492fe8a958bf495351c54b625))

# [5.1.0](https://github.com/speclynx/apidom/compare/v5.0.2...v5.1.0) (2026-08-09)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.0.2](https://github.com/speclynx/apidom/compare/v5.0.1...v5.0.2) (2026-08-04)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [5.0.1](https://github.com/speclynx/apidom/compare/v5.0.0...v5.0.1) (2026-07-07)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [5.0.0](https://github.com/speclynx/apidom/compare/v4.16.0...v5.0.0) (2026-07-07)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.16.0](https://github.com/speclynx/apidom/compare/v4.15.0...v4.16.0) (2026-06-24)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.15.0](https://github.com/speclynx/apidom/compare/v4.14.0...v4.15.0) (2026-06-24)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.14.0](https://github.com/speclynx/apidom/compare/v4.13.0...v4.14.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.13.0](https://github.com/speclynx/apidom/compare/v4.12.1...v4.13.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [4.12.1](https://github.com/speclynx/apidom/compare/v4.12.0...v4.12.1) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.12.0](https://github.com/speclynx/apidom/compare/v4.11.1...v4.12.0) (2026-06-23)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [4.11.1](https://github.com/speclynx/apidom/compare/v4.11.0...v4.11.1) (2026-06-10)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.11.0](https://github.com/speclynx/apidom/compare/v4.10.1...v4.11.0) (2026-06-10)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [4.10.1](https://github.com/speclynx/apidom/compare/v4.10.0...v4.10.1) (2026-05-20)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.10.0](https://github.com/speclynx/apidom/compare/v4.9.1...v4.10.0) (2026-05-12)

### Features

- **overlay:** add support for overlay generation by diffing API docs ([#278](https://github.com/speclynx/apidom/issues/278)) ([41fca34](https://github.com/speclynx/apidom/commit/41fca3455bce2e637b1e53f78f3f60afd93ef16c))

## [4.9.1](https://github.com/speclynx/apidom/compare/v4.9.0...v4.9.1) (2026-04-21)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.9.0](https://github.com/speclynx/apidom/compare/v4.8.0...v4.9.0) (2026-04-17)

**Note:** Version bump only for package @speclynx/apidom-overlay

# [4.8.0](https://github.com/speclynx/apidom/compare/v4.7.1...v4.8.0) (2026-04-17)

**Note:** Version bump only for package @speclynx/apidom-overlay

## [4.7.1](https://github.com/speclynx/apidom/compare/v4.7.0...v4.7.1) (2026-04-16)

**Note:** Version bump only for package @speclynx/apidom-overlay

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
