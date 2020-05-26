# StormJS

[![Join chat](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat)](https://gitter.im/wowserhq/wowser)
[![Version](https://img.shields.io/npm/v/@wowserhq/stormjs.svg?style=flat)](https://www.npmjs.org/package/@wowserhq/stormjs)
[![Build Status](https://travis-ci.org/wowserhq/stormjs.svg?branch=master)](https://travis-ci.org/wowserhq/stormjs)
[![Test Coverage](https://api.codeclimate.com/v1/badges/829e88cf1899d0061b88/test_coverage)](https://codeclimate.com/github/wowserhq/stormjs/test_coverage)
[![Vulnerabilities](https://snyk.io/test/github/wowserhq/stormjs/badge.svg?targetFile=package.json)](https://snyk.io/test/github/wowserhq/stormjs?targetFile=package.json)

StormJS is [StormLib](http://www.zezula.net/en/mpq/stormlib.html) for Javascript, powered by
[Emscripten](http://emscripten.org).

StormJS is copyright © Wowser Contributors. It is licensed under the **MIT** license. See
`LICENSE` for more information.

[StormLib](http://www.zezula.net/en/mpq/stormlib.html) is copyright © Ladislav Zezula. It is
licensed under the [**MIT** license](https://github.com/ladislav-zezula/StormLib/blob/master/LICENSE).
See `src/vendor/StormLib/LICENSE` for more information.

## Usage

To install StormJS:

```sh
npm install @wowserhq/stormjs
```

To use StormJS in an ES2015 module environment:

```js
import { FS, MPQ } from '@wowserhq/stormjs';

// Mount the local filesystem path /home/wowserhq/example as /stormjs
// This approach is suitable for cases where StormJS is running under Node
FS.mkdir('/stormjs');
FS.mount(FS.filesystems.NODEFS, { root: '/home/wowserhq/example' }, '/stormjs');

const mpq = await MPQ.open('/stormjs/example.mpq', 'r');
const file = base.openFile('example.txt');
const data = file.read();

// Clean up
file.close();
mpq.close();
```

Note that StormJS loads in production mode if `NODE_ENV` is set to `production`. In all other cases, StormJS loads in debug mode.

## Compatibility

StormJS is tested against Node 8 and Node 10.

Additionally, StormJS should work well in browsers with support for WASM. Note that use in browsers will require configuring an Emscripten filesystem type appropriate for the browser.

## Development

Development of StormJS requires git, CMake, and an Emscripten environment.

[emsdk](https://github.com/juj/emsdk) is the simplest way to get an Emscripten environment up and running.

StormJS is currently built using Emscripten 1.39.15.

After cloning the StormJS repo, ensure all submodules are also pulled down from remote by running:

```sh
git submodule update --init --recursive
```

To build StormJS after making changes locally, run:

```sh
npm run build
```

The test suites for StormJS can be run using:

```sh
npm run test
```
