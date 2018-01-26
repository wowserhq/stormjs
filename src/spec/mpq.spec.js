import path from 'path';
import { FS, MPQ } from '../lib';

const rootDir = path.resolve(__filename, '../../../');

describe('MPQ', () => {
  beforeAll(() => {
    FS.mkdir('/fixture');
    FS.mount(FS.filesystems.NODEFS, { root: `${rootDir}/fixture` }, '/fixture');
  });

  test('permits opening and closing an MPQ', async () => {
    const mpq = await MPQ.open('/fixture/vanilla-standard.mpq');

    mpq.close();

    expect(mpq).toBeInstanceOf(MPQ);
  });
});
