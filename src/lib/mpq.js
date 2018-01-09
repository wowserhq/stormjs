import StormLib from './stormlib';

class MPQ {
  constructor(handle) {
    this.handle = handle;
  }
}

MPQ.open = async function (path) {
  await StormLib.ready;

  const handle = new StormLib.Ptr();

  if (StormLib.SFileOpenArchive(path, 0, 0, handle)) {
    const mpq = new MPQ(handle);
  } else {
    throw 'Could not open MPQ!';
  }
}

export default MPQ;
