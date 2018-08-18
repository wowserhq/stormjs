import path from 'path';
import { Writable } from 'stream';
import { File, FS, MPQ } from '../lib';
import StormLib from '../lib/stormlib';

const rootDir = path.resolve(__filename, '../../../');

class WritableMemoryStream extends Writable {
  constructor() {
    super();
    this._data = new Buffer([]);
  }

  _write(data, _enc, cb) {
    this._data = Buffer.concat([this._data, data]);
    cb(null);
  }

  toArray() {
    return new Uint8Array(this._data);
  }
}

describe('File', () => {
  beforeAll(() => {
    FS.mkdir('/fixture');
    FS.mount(FS.filesystems.NODEFS, { root: `${rootDir}/fixture` }, '/fixture');
  });

  describe('Closing', () => {
    test('closes valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const result = file.close();

      expect(result).toBeUndefined();

      mpq.close();
    });

    test('throws if closing file with invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      expect(() => file.close()).toThrow(Error);

      invalidHandle.delete();
      file.handle = originalHandle;
      file.close();
      mpq.close();
    });

    test('noops if closing already closed file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      file.close();

      const result = file.close();

      expect(result).toBeUndefined();

      mpq.close();
    });
  });

  describe('Reading', () => {
    test('gets pos for valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const pos = file.pos;

      expect(pos).toBe(0);

      file.close();
      mpq.close();
    });

    test('sets pos for valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      file.pos = 1;

      const pos = file.pos;

      expect(pos).toBe(1);

      file.close();
      mpq.close();
    });

    test('throws if setting pos for closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      expect(() => { file.pos = 1; }).toThrow(Error);

      mpq.close();
    });

    test('throws if setting pos for file with invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      expect(() => { file.pos = 1; }).toThrow(Error);

      invalidHandle.delete();
      file.handle = originalHandle;
      file.close();
      mpq.close();
    });

    test('gets size for valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const size = file.size;

      expect(size).toBe(13);

      file.close();
      mpq.close();
    });

    test('throws if getting size for closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      expect(() => file.size).toThrow(Error);

      mpq.close();
    });

    test('throws if getting size for file with invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      expect(() => file.size).toThrow(Error);

      invalidHandle.delete();
      file.handle = originalHandle;
      file.close();
      mpq.close();
    });

    test('pipes valid file into stream', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      source.on('end', () => {
        expect(destination.toArray()).toEqual(new Uint8Array([
          102, 105, 120, 116, 117, 114, 101, 45, 116, 101, 120, 116, 10
        ]));

        file.close();
        mpq.close();

        done();
      });

      source.pipe(destination);
    });

    test('pipes valid file with size = STREAM_CHUNK_SIZE into stream', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/size.mpq');
      const file = mpq.openFile('fixture-64kb.txt');

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      source.on('end', () => {
        expect(destination.toArray().subarray(0, 16)).toEqual(new Uint8Array([
          97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112
        ]));

        file.close();
        mpq.close();

        done();
      });

      source.pipe(destination);
    });

    test('pipes valid file with size = 2 * STREAM_CHUNK_SIZE into stream', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/size.mpq');
      const file = mpq.openFile('fixture-128kb.txt');

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      source.on('end', () => {
        expect(destination.toArray().subarray(0, 16)).toEqual(new Uint8Array([
          97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112
        ]));

        file.close();
        mpq.close();

        done();
      });

      source.pipe(destination);
    });

    test('emits error if piping closed file', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      Object.defineProperty(file, 'pos', { set: () => {} });

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      source.on('error', (error) => {
        expect(error).toBeInstanceOf(Error);

        mpq.close();

        done();
      });

      file.close();

      source.pipe(destination);
    });

    test('emits error if piping file with invalid handle', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      Object.defineProperty(file, 'pos', { set: () => {} });

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      source.on('error', (error) => {
        expect(error).toBeInstanceOf(Error);

        invalidHandle.delete();
        file.handle = originalHandle;
        file.close();
        mpq.close();

        done();
      });

      file.handle = invalidHandle;

      source.pipe(destination);
    });

    test('emits error when setting pos in piping file with invalid handle', async (done) => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const source = file.createStream();
      const destination = new WritableMemoryStream();

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      source.on('error', (error) => {
        expect(error).toBeInstanceOf(Error);

        invalidHandle.delete();
        file.handle = originalHandle;
        file.close();
        mpq.close();

        done();
      });

      file.handle = invalidHandle;

      source.pipe(destination);
    });

    test('reads valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const result = file.read();

      expect(result).toEqual(new Uint8Array([
        102, 105, 120, 116, 117, 114, 101, 45, 116, 101, 120, 116, 10
      ]));

      file.close();
      mpq.close();
    });

    test('reads valid file twice', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const read1 = file.read();
      const read2 = file.read();

      expect(read1).toEqual(new Uint8Array([
        102, 105, 120, 116, 117, 114, 101, 45, 116, 101, 120, 116, 10
      ]));

      expect(read2).toEqual(read1);

      file.close();
      mpq.close();
    });

    test('throws if reading closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      expect(() => file.read()).toThrow(Error);

      mpq.close();
    });

    test('throws if reading file with invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      Object.defineProperty(file, 'pos', { set: () => {} });
      Object.defineProperty(file, 'size', { get: () => 1 });

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      expect(() => file.read()).toThrow(Error);

      invalidHandle.delete();
      file.handle = originalHandle;
      file.close();
      mpq.close();
    });

    test('gets name for valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const name = file.name;

      expect(name).toBe('fixture.txt');

      file.close();
      mpq.close();
    });

    test('gets name for valid file with repeated calls', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const name1 = file.name;
      const name2 = file.name;

      expect(name1).toBe(name2);

      file.close();
      mpq.close();
    });

    test('throws if getting name for closed file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      expect(() => { const name = file.name; }).toThrow(Error);

      mpq.close();
    });

    test('throws if getting name for file with invalid handle', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      expect(() => { const name = file.name; }).toThrow(Error);

      invalidHandle.delete();
      file.handle = originalHandle;
      file.close();
      mpq.close();
    });
  });
});
