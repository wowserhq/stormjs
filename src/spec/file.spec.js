import path from 'path';
import { File, FS, MPQ } from '../lib';
import StormLib from '../lib/stormlib';

const rootDir = path.resolve(__filename, '../../../');

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
      const invalidHandle = new StormLib.Ptr();

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
});
