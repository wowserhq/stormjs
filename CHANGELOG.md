# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0](https://github.com/wowserhq/stormjs/compare/v0.3.0...v0.4.0) (2020-05-27)


### ⚠ BREAKING CHANGES

* We no longer support Node 8 or earlier. Node 10 is the oldest version actively maintained.

### Bug Fixes

* support new esm handling in node 12 and 14 ([#53](https://github.com/wowserhq/stormjs/issues/53)) ([11d0842](https://github.com/wowserhq/stormjs/commit/11d0842fb53a5d19dcd8a758659c1abbb87e981f))
* use explicit file extensions with es modules ([#51](https://github.com/wowserhq/stormjs/issues/51)) ([ae78d74](https://github.com/wowserhq/stormjs/commit/ae78d744a2a4fa9135b81ff86fb8d9e5c07b3d4c))
* use module field as esm hint for bundlers ([#52](https://github.com/wowserhq/stormjs/issues/52)) ([92083e0](https://github.com/wowserhq/stormjs/commit/92083e0677b9c6ee872ee124b9a50886d186198f))

## 0.3.0 - 2018-08-17

### Added

- File name getter

### Fixed

- Fix issue loading MPQs >= 2GB
- Fix incompatibility with ES module support in Node

### Changed

- Improve README

## 0.2.0 - 2018-08-12

### Added

- File searching
- File opening and closing
- File reading
- MPQ patching

### Changed

- Upgrade to emscripten 1.38.11
- Improve test suites

## 0.1.0 - 2018-01-15

### Added

- Initial release
