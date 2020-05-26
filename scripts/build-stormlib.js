const path = require('path');
const util = require('util');
const process = require('process');
const childProcess = require('child_process');
const fs = require('fs-extra');
const commandExists = require('command-exists');

const exec = util.promisify(childProcess.exec);

const root = path.resolve(__filename, '../../');

async function build() {
  console.info('Building StormLib with Emscripten');

  await checkEnvironment();

  const buildRoot = path.resolve(root, './build');
  const debugBuildRoot = path.resolve(buildRoot, './debug');
  const releaseBuildRoot = path.resolve(buildRoot, './release');

  const distDir = path.resolve(root, './dist');

  await buildDebug(debugBuildRoot, distDir);
  await buildRelease(releaseBuildRoot, distDir);
}

function checkCommand(command) {
  return new Promise(function (resolve, reject) {
    commandExists(command, function(error, exists) {
      if (error) {
        reject(error);
      } else {
        resolve(exists);
      }
    });
  });
}

async function checkEnvironment() {
  console.info('');
  console.info('Checking environment');

  const missing = [];

  if (!await checkCommand('cmake')) {
    missing.push('cmake');
  }

  if (!await checkCommand('make')) {
    missing.push('make');
  }

  if (!await checkCommand('emcmake')) {
    missing.push('emcmake');
  }

  if (!await checkCommand('emmake')) {
    missing.push('emmake');
  }

  if (!await checkCommand('emcc')) {
    missing.push('emcc');
  }

  if (missing.length > 0) {
    console.error(`Missing commands: ${missing.join(' ')}`);
    console.error('A build environment and Emscripten are required in order to build StormLib');
    console.error('Exiting with error code 1');

    process.exit(1);
  }
}

async function setupBuildRoot(buildRoot) {
  console.info(`Setting up build root: ${buildRoot}`);

  await fs.mkdirp(buildRoot);

  console.info('Copying files into build root');

  const vendorDir = path.resolve(root, './src/vendor');
  const overrideDir = path.resolve(root, './src/override');
  const bindingDir = path.resolve(root, './src/binding');

  await fs.copy(`${vendorDir}/StormLib`, `${buildRoot}/StormLib`);
  await fs.copy(`${overrideDir}/CMakeLists.txt`, `${buildRoot}/StormLib/CMakeLists.txt`);
  await fs.copy(`${bindingDir}/EmStormLib.cpp`, `${buildRoot}/EmStormLib.cpp`);
}

async function buildDebug(buildRoot, distDir) {
  console.info('Building debug build');

  await setupBuildRoot(buildRoot);

  process.chdir(buildRoot);

  console.info('Running cmake');

  const cmakeFlags = [
    '-DBUILD_SHARED_LIBS=1',
    '-DCMAKE_BUILD_TYPE=Release'
  ];

  const { cmakeOut, cmakeErr } = await emcmake(cmakeFlags, './StormLib');

  console.info('Running make target storm');

  const makeTarget = 'storm';

  const { makeOut, makeErr } = await emmake(makeTarget);

  const sharedCompileFlags = [
    '-O0',
    '-g2',
    '-s ASSERTIONS=2'
  ];

  console.info('Compiling bindings');

  const bindingCompileFlags = sharedCompileFlags.concat([
    '-c -std=c++11',
    '-I./StormLib/src',
    '-o EmStormLib.bc'
  ]);

  const bindingFiles = [
    'EmStormLib.cpp'
  ];

  const { bindingOut, bindingErr } = await emcc(bindingCompileFlags, bindingFiles);

  console.info('Compiling wasm module');

  const wasmCompileFlags = sharedCompileFlags.concat([
    '--bind',
    '--post-js ../../src/binding/post.js',
    '-s WASM=1',
    '-s ALLOW_MEMORY_GROWTH=1',
    '-s SINGLE_FILE=1',
    '-s MODULARIZE=1',
    '-s DEMANGLE_SUPPORT=1',
    '-s EXPORT_NAME="\'StormLib\'"',
    '-s EXTRA_EXPORTED_RUNTIME_METHODS="[\'FS\']"',
    '-l nodefs.js',
    '-o stormlib.debug.js'
  ]);

  const wasmFiles = [
    'libstorm.a',
    'EmStormLib.bc'
  ];

  const { wasmOut, wasmErr } = await emcc(wasmCompileFlags, wasmFiles);

  console.info('Copying build artifact');

  await fs.mkdirp(distDir);

  await fs.copy(`${buildRoot}/stormlib.debug.js`, `${distDir}/stormlib.debug.js`);
}

async function buildRelease(buildRoot, distDir) {
  console.info('Building release build');

  await setupBuildRoot(buildRoot);

  process.chdir(buildRoot);

  console.info('Running cmake');

  const cmakeFlags = [
    '-DBUILD_SHARED_LIBS=1',
    '-DCMAKE_BUILD_TYPE=Release'
  ];

  const { cmakeOut, cmakeErr } = await emcmake(cmakeFlags, './StormLib');

  console.info('Running make target storm');

  const makeTarget = 'storm';

  const { makeOut, makeErr } = await emmake(makeTarget);

  const sharedCompileFlags = [
    '-O1',
    '--llvm-opts "[\'-O3\']"'
  ];

  console.info('Compiling bindings');

  const bindingCompileFlags = sharedCompileFlags.concat([
    '-c -std=c++11',
    '-I./StormLib/src',
    '-o EmStormLib.bc'
  ]);

  const bindingFiles = [
    'EmStormLib.cpp'
  ];

  const { bindingOut, bindingErr } = await emcc(bindingCompileFlags, bindingFiles);

  console.info('Compiling wasm module');

  const wasmCompileFlags = sharedCompileFlags.concat([
    '--bind',
    '--post-js ../../src/binding/post.js',
    '-s WASM=1',
    '-s ALLOW_MEMORY_GROWTH=1',
    '-s SINGLE_FILE=1',
    '-s MODULARIZE=1',
    '-s EXPORT_NAME="\'StormLib\'"',
    '-s EXTRA_EXPORTED_RUNTIME_METHODS="[\'FS\']"',
    '-l nodefs.js',
    '-o stormlib.release.js'
  ]);

  const wasmFiles = [
    'libstorm.a',
    'EmStormLib.bc'
  ];

  const { wasmOut, wasmErr } = await emcc(wasmCompileFlags, wasmFiles);

  console.info('Copying build artifact');

  await fs.mkdirp(distDir);

  await fs.copy(`${buildRoot}/stormlib.release.js`, `${distDir}/stormlib.release.js`);
}

async function emcmake(flags = [], path = '.') {
  const command = `emcmake cmake ${flags.join(' ')} ${path}`;

  console.debug(command);

  return exec(command);
}

async function emmake(target = '') {
  const command = `emmake make ${target}`;

  console.debug(command);

  return exec(command);
}

async function emcc(flags = [], files = []) {
  const command = `emcc ${flags.join(' ')} ${files.join(' ')}`;

  console.debug(command);

  return exec(command);
}

async function buildSafely() {
  try {
    await build();
  } catch (e) {
    console.error(e);
    console.error('Exiting with error code 1');

    process.exit(1);
  }
}

buildSafely();
