import FileStream from './stream';
import StormLib from '../stormlib';

class File {
  constructor(handle) {
    this.handle = handle;
    this.data = null;

    this._pos = 0;
  }

  get pos() {
    return this._pos;
  }

  set pos(pos) {
    this._ensureHandle();

    const result = StormLib.SFileSetFilePointer(
      this.handle, pos, StormLib.NULLPTR, StormLib.FILE_BEGIN
    );

    if (result === StormLib.SFILE_INVALID_SIZE) {
      const errno = StormLib.GetLastError();
      throw new Error(`File pos could not be set (error ${errno})`);
    }

    this._pos = pos;
  }

  get size() {
    this._ensureHandle();

    const size = StormLib.SFileGetFileSize(this.handle, StormLib.NULLPTR);

    if (size === StormLib.SFILE_INVALID_SIZE) {
      const errno = StormLib.GetLastError();
      throw new Error(`File size could not be determined (error ${errno})`);
    }

    return size;
  }

  close() {
    if (this.handle) {
      if (StormLib.SFileCloseFile(this.handle)) {
        this.handle.delete();
        this.handle = null;

        if (this.data) {
          this.data.delete();
          this.data = null;
        }
      } else {
        const errno = StormLib.GetLastError();
        throw new Error(`Archive could not be closed (error ${errno})`);
      }
    }
  }

  createStream() {
    this._ensureHandle();
    return new FileStream(this);
  }

  read() {
    this._ensureHandle();

    const size = this.size;

    if (!this.data) {
      this.data = new StormLib.Buf(size);
    }

    this.pos = 0;

    const success = StormLib.SFileReadFile(
      this.handle, this.data, size, StormLib.NULLPTR, StormLib.NULLPTR
    );

    if (success) {
      return this.data.toJS();
    } else {
      this.data.delete();
      this.data = null;

      const errno = StormLib.GetLastError();
      throw new Error(`File could not be read (error ${errno})`);
    }
  }

  _ensureHandle() {
    if (!this.handle) {
      throw new Error('Invalid handle');
    }
  }
}

export default File;
