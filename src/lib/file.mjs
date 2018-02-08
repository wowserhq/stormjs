import StormLib from './stormlib';

const PIPE_CHUNK_SIZE = 128 * 1024;

class File {
  constructor(handle) {
    this.handle = handle;
    this.data = null;
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

  pipe(stream) {
    this._ensureHandle();

    const size = this.size;

    let remainSize = size;
    let readSize = Math.min(PIPE_CHUNK_SIZE, size);

    const data = new StormLib.Buf(readSize);

    try {
      while (readSize > 0) {
        let success = StormLib.SFileReadFile(
          this.handle, data, readSize, StormLib.NULLPTR, StormLib.NULLPTR
        );

        if (success) {
          if (readSize === PIPE_CHUNK_SIZE) {
            stream.write(data.toJS());
          } else {
            stream.write(data.toJS().subarray(0, readSize));
          }

          remainSize -= readSize;
          readSize = Math.min(PIPE_CHUNK_SIZE, remainSize);
        } else {
          const errno = StormLib.GetLastError();
          throw new Error(`File could not be piped (error ${errono})`);
        }
      }
    } finally {
      data.delete();
      stream.end();
    }
  }

  read() {
    this._ensureHandle();

    const size = this.size;

    if (!this.data) {
      this.data = new StormLib.Buf(size);
    }

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
