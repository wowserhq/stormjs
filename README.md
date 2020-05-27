# StormJS

[![Join Community](https://badgen.net/badge/discord/join%20community/blue)](https://discord.gg/DeVVKVg)
[![Version](https://badgen.net/npm/v/@wowserhq/stormjs)](https://www.npmjs.org/package/@wowserhq/stormjs)
[![MIT License](https://badgen.net/github/license/wowserhq/stormjs)](LICENSE)
[![CI](https://github.com/wowserhq/stormjs/workflows/CI/badge.svg)](https://github.com/wowserhq/math/actions?query=workflow%3ACI)
[![Test Coverage](https://codecov.io/gh/wowserhq/stormjs/branch/master/graph/badge.svg)](https://codecov.io/gh/wowserhq/stormjs)

StormJS is [StormLib](http://www.zezula.net/en/mpq/stormlib.html) for Javascript, powered by
[Emscripten](http://emscripten.org).

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

StormJS is tested against Node 10, 12, and 14.

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
