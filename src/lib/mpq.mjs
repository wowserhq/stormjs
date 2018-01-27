import StormLib from './stormlib';

class MPQ {
  constructor(handle) {
    this.handle = handle;
  }

  close() {
    if (this.handle) {
      if (StormLib.SFileCloseArchive(this.handle)) {
        this.handle.delete();
        this.handle = null;
      } else {
        const errno = StormLib.GetLastError();
        throw new Error(`Archive could not be closed (error ${errno})`);
      }
    }
  }
}

MPQ.open = async function (path, flags = 0) {
  await StormLib.ready;

  const handle = new StormLib.Ptr();
  const priority = 0;

  if (StormLib.SFileOpenArchive(path, priority, flags, handle)) {
    return new MPQ(handle);
  } else {
    const errno = StormLib.GetLastError();
    throw new Error(`Archive could not be opened (error ${errno})`);
  }
};

export default MPQ;
