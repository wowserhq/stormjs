import StormLib from './stormlib';

class MPQ {
  constructor(handle) {
    this.handle = handle;
  }
}

MPQ.open = async function (path, flags = 0) {
  await StormLib.ready;

  const handle = new StormLib.Ptr();
  const priority = 0;

  if (StormLib.SFileOpenArchive(path, priority, flags, handle)) {
    const mpq = new MPQ(handle);
  } else {
    throw 'Could not open MPQ!';
  }
}

export default MPQ;
