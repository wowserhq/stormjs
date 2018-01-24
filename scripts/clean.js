const path = require('path');
const fs = require('fs-extra');

const root = path.resolve(__filename, '../../');
const distDir = path.resolve(root, './dist');
const buildDir = path.resolve(root, './build');

async function clean() {
  await cleanDir(buildDir);
  await cleanDir(distDir);
}

async function cleanDir(dir) {
  if (await fs.pathExists(dir)) {
    await fs.emptydir(dir);
    await fs.rmdir(dir);
  }
}

async function cleanSafely() {
  try {
    await clean();
  } catch (e) {
    console.error(e);
    console.error('Exiting with error code 1');

    process.exit(1);
  }
}

cleanSafely();
