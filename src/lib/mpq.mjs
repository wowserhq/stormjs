import File from './file';
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

  openFile(fileName) {
    if (this.handle) {
      const fileHandle = new StormLib.VoidPtr();

      if (StormLib.SFileOpenFileEx(this.handle, fileName, 0, fileHandle)) {
        return new File(fileHandle);
      } else {
        fileHandle.delete();

        const errno = StormLib.GetLastError();
        throw new Error(`File could not be opened (error ${errno})`);
      }
    }
  }
}

MPQ.open = async function (path, flags = 0) {
  await StormLib.ready;

  const handle = new StormLib.VoidPtr();
  const priority = 0;

  if (StormLib.SFileOpenArchive(path, priority, flags, handle)) {
    return new MPQ(handle);
  } else {
    const errno = StormLib.GetLastError();
    throw new Error(`Archive could not be opened (error ${errno})`);
  }
};

export default MPQ;
