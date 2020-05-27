import Stream from 'stream';
import StormLib from '../stormlib.js';

const STREAM_CHUNK_SIZE = 64 * 1024;

class FileStream extends Stream.Readable {
  constructor(file) {
    super({
      highWaterMark: STREAM_CHUNK_SIZE
    });

    this._file = file;
    this._size = file.size;
    this._pos = 0;
    this._buffer = new StormLib.Buf(Math.min(STREAM_CHUNK_SIZE, this._size));

    this.on('end', () => {
      this.destroy();
    });
  }

  _destroy() {
    this._buffer.delete();
    this._buffer = null;
    this._file = null;
  }

  _die(error) {
    this.destroy();
    this.emit('error', error);
  }

  _read(size) {
    if (!this._file.handle) {
      this._die(new Error('Missing file handle'));
      return;
    }

    try {
      this._file.pos = this._pos;
    } catch (error) {
      this._die(error);
      return;
    }

    const read = Math.min(STREAM_CHUNK_SIZE, size, this._size - this._pos);

    let success = StormLib.SFileReadFile(
      this._file.handle, this._buffer, read, StormLib.NULLPTR, StormLib.NULLPTR
    );

    if (success) {
      if (read === STREAM_CHUNK_SIZE) {
        this.push(this._buffer.toJS());
      } else {
        this.push(this._buffer.toJS().subarray(0, read));
      }

      this._pos += read;

      if (this._pos === this._size) {
        this.push(null);
      }
    } else {
      const errno = StormLib.GetLastError();
      this._die(new Error(`File could not be streamed (error ${errno})`));
    }
  }
}

export default FileStream;
