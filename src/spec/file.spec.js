import path from 'path';
import { File, FS, MPQ } from '../lib';
import StormLib from '../lib/stormlib';

const rootDir = path.resolve(__filename, '../../../');

class MockStream {
  constructor() {
    this.data = new Buffer([]);
  }

  write(data) {
    this.data = Buffer.concat([this.data, data]);
  }

  toArray() {
    return new Uint8Array(this.data);
  }

  end() {}
}

describe('File', () => {
  beforeAll(() => {
    FS.mkdir('/fixture');
    FS.mount(FS.filesystems.NODEFS, { root: `${rootDir}/fixture` }, '/fixture');
  });

  describe('Closing', () => {
    test('closes a valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const result = file.close();

      expect(result).toBeUndefined();
    });

    test('throws if closing a file with an invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      try {
        file.handle = invalidHandle;
        file.close();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        file.handle = originalHandle;
        file.close();
        mpq.close();
      }
    });

    test('noops if closing an already closed file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      file.close();
      const result = file.close();

      expect(result).toBeUndefined();

      mpq.close();
    });
  });

  describe('Reading', () => {
    test('gets size for a valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const result = file.size;

      expect(result).toBe(13);

      file.close();
      mpq.close();
    });

    test('throws if getting size for a closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      try {
        const result = file.size;
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        mpq.close();
      }
    });

    test('throws if getting size for a file with an invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      try {
        const size = file.size;
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        file.handle = originalHandle;
        file.close();
        mpq.close();
      }
    });

    test('pipes valid file into stream', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      const stream = new MockStream();

      file.pipe(stream);

      expect(stream.toArray()).toEqual(new Uint8Array([
        102, 105, 120, 116, 117, 114, 101, 45, 116, 101, 120, 116, 10
      ]));

      file.close();
      mpq.close();
    });

    test('throws if piping a closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      const stream = new MockStream();
      file.close();

      try {
        file.pipe(stream);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        mpq.close();
      }
    });

    test('throws if piping a file with an invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      const stream = new MockStream();

      Object.defineProperty(file, 'size', { get: () => 1 });

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      try {
        file.pipe(stream);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        file.handle = originalHandle;
        file.close();
        mpq.close();
      }
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

    test('throws if reading a closed file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');
      file.close();

      try {
        const data = file.read();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        mpq.close();
      }
    });

    test('throws if reading a file with an invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      Object.defineProperty(file, 'size', { get: () => 1 });

      const originalHandle = file.handle;
      const invalidHandle = new StormLib.VoidPtr();

      file.handle = invalidHandle;

      try {
        const data = file.read();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        file.handle = originalHandle;
        file.close();
        mpq.close();
      }
    });
  });
});
