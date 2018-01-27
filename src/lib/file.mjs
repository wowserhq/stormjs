import StormLib from './stormlib';

class File {
  constructor(handle) {
    this.handle = handle;
  }

  close() {
    if (this.handle) {
      if (StormLib.SFileCloseFile(this.handle)) {
        this.handle.delete();
        this.handle = null;
      } else {
        const errno = StormLib.GetLastError();
        throw new Error(`Archive could not be closed (error ${errno})`);
      }
    }
  }
}

export default File;
