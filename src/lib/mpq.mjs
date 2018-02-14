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

  hasFile(fileName) {
    this._ensureHandle();

    if (StormLib.SFileHasFile(this.handle, fileName)) {
      return true;
    } else {
      const errno = StormLib.GetLastError();

      if (errno === StormLib.ERROR_FILE_NOT_FOUND) {
        return false;
      } else {
        throw new Error(`File presence check failed (error ${errno})`);
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

  search(mask, listfile = '') {
    this._ensureHandle();

    const findData = new StormLib.SFileFindData();

    const findHandle = StormLib.SFileFindFirstFile(this.handle, mask, findData, listfile);

    if (findHandle.isNull()) {
      const errno = StormLib.GetLastError();

      findData.delete();
      findHandle.delete();

      if (errno === StormLib.ERROR_NO_MORE_FILES) {
        return [];
      } else {
        throw new Error(`Find failed (error ${errno})`);
      }
    }

    const results = [];

    results.push(findData.toJS());

    while (StormLib.SFileFindNextFile(findHandle, findData)) {
      results.push(findData.toJS());
    }

    StormLib.SFileFindClose(findHandle);

    findData.delete();
    findHandle.delete();

    return results;
  }

  _ensureHandle() {
    if (!this.handle) {
      throw new Error('Invalid handle');
    }
  }

  static async open(path, flags = 0) {
    await StormLib.ready;

    const handle = new StormLib.VoidPtr();
    const priority = 0;

    if (StormLib.SFileOpenArchive(path, priority, flags, handle)) {
      return new MPQ(handle);
    } else {
      const errno = StormLib.GetLastError();
      throw new Error(`Archive could not be opened (error ${errno})`);
    }
  }
}

export default MPQ;
