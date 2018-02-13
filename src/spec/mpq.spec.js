import path from 'path';
import { File, FS, MPQ } from '../lib';
import StormLib from '../lib/stormlib';

const rootDir = path.resolve(__filename, '../../../');

describe('MPQ', () => {
  beforeAll(() => {
    FS.mkdir('/fixture');
    FS.mount(FS.filesystems.NODEFS, { root: `${rootDir}/fixture` }, '/fixture');
  });

  describe('Opening / Closing', () => {
    test('opens and closes an MPQ', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      mpq.close();

      expect(mpq).toBeInstanceOf(MPQ);
    });

    test('throws if opening a nonexistent MPQ', async () => {
      expect.assertions(1);

      try {
        const mpq = await MPQ.open('/fixture/nonexistent.mpq');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });

    test('throws if closing an MPQ with an invalid handle', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const originalHandle = mpq.handle;
      const invalidHandle = new StormLib.VoidPtr();

      try {
        mpq.handle = invalidHandle;
        mpq.close();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        mpq.handle = originalHandle;
        mpq.close();
      }
    });

    test('closes MPQ with noop if already closed', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      let result;

      result = mpq.close();
      result = mpq.close();

      expect(result).toBeUndefined();
    });
  });

  describe('Files', () => {
    test('opens and returns a valid file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');
      const file = mpq.openFile('fixture.txt');

      expect(file).toBeInstanceOf(File);

      file.close();
      mpq.close();
    });

    test('returns undefined if opening a file from a closed MPQ', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      mpq.close();

      const file = mpq.openFile('fixture.txt');

      expect(file).toBeUndefined();
    });

    test('throws if opening a nonexistent file', async () => {
      expect.assertions(1);

      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      try {
        const file = mpq.openFile('nonexistent.txt');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }

      mpq.close();
    });

    test('checks for presence of file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const result = mpq.hasFile('fixture.txt');

      expect(result).toBe(true);

      mpq.close();
    });

    test('checks for presence of nonexistent file', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const result = mpq.hasFile('foo-bar.baz');

      expect(result).toBe(false);

      mpq.close();
    });

    test('throws if checking for presence of file in closed MPQ', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      mpq.close();

      expect(() => mpq.hasFile('foo-bar.baz')).toThrow(Error);
    });

    test('throws if checking for presence of file in MPQ with invalid handle', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const originalHandle = mpq.handle;
      const invalidHandle = new StormLib.VoidPtr();

      mpq.handle = invalidHandle;

      expect(() => mpq.hasFile('foo-bar.baz')).toThrow(Error);

      invalidHandle.delete();
      mpq.handle = originalHandle;
      mpq.close();
    });
  });

  describe('Search', () => {
    test('finds all files', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const results = mpq.search('*');

      expect(results).toBeInstanceOf(Array);

      expect(results.map((r) => r.fileName)).toEqual([
        'fixture-deDE.txt',
        '(listfile)',
        'nested\\fixture-nested.txt',
        'fixture.png',
        '(attributes)',
        'fixture.txt',
        'fixture.xml'
      ]);

      mpq.close();
    });

    test('returns result with appropriate shape', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const result = mpq.search('fixture.txt')[0];

      expect(result).toEqual({
        fileName: 'fixture.txt',
        plainName: 'fixture.txt',
        hashIndex: 3886,
        blockIndex: 0,
        fileSize: 13,
        compSize: 21,
        fileTimeLo: 414638976,
        fileTimeHi: 30643794,
        locale: 0
      });

      mpq.close();
    });

    test('returns empty array if no results found', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const results = mpq.search('foo-bar.baz');

      expect(results).toEqual([]);

      mpq.close();
    });

    test('throws if calling find on closed mpq', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      mpq.close();

      expect(() => mpq.search('*')).toThrow(Error);
    });

    test('throws if calling find on mpq with invalid handle', async () => {
      const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

      const originalHandle = mpq.handle;
      const invalidHandle = new StormLib.VoidPtr();

      mpq.handle = invalidHandle;

      expect(() => mpq.search('*')).toThrow(Error);

      mpq.handle = originalHandle;
      mpq.close();
    });
  });
});
