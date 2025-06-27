import { beforeAll, describe, expect, it, vi } from 'vitest';

import { plugin } from '../plugin';

const fs = vi.hoisted(() => ({
  existsSync: vi.fn().mockReturnValue(true),
  lstatSync: vi.fn().mockImplementation((filepath: string) => ({
    isDirectory: () => !filepath.split('/').at(-1)!.includes('.')
  })),
  promises: {
    readdir: vi.fn().mockImplementation((filepath: string) => {
      if (filepath.endsWith('v1')) {
        return [];
      }
      return ['v1'];
    })
  }
}));

vi.mock('fs', () => fs);

// describe('resolveVersion', () => {
//   beforeEach(() => {
//     vi.spyOn(fs.promises, 'readdir').mockResolvedValueOnce(['index.js', 'index.d.ts'] as any);
//     vi.spyOn(fs, 'existsSync').mockReturnValue(true);
//     vi.spyOn(fs.promises, 'lstat').mockImplementation((filepath) => {
//       return Promise.resolve({ isDirectory: () => !path.extname(filepath as string) } as any);
//     });
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   it('should throw if the resolved baseDir does not exist', async () => {
//     vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
//     await expect(() => resolveVersion('v0')).rejects.toThrow('Not a directory');
//   });

//   it('should throw if the resolved baseDir is not a directory', async () => {
//     vi.spyOn(fs.promises, 'lstat').mockResolvedValueOnce({ isDirectory: () => false } as any);
//     await expect(() => resolveVersion('v0')).rejects.toThrow('Not a directory');
//   });
//   it('should sort the manifest files appropriately', async () => {
//     await expect(resolveVersion('v0')).resolves.toMatchObject({
//       manifest: {
//         declarations: ['index.d.ts'],
//         sources: ['index.js']
//       }
//     });
//   });
//   it('should recurse into directories', async () => {
//     vi.spyOn(fs.promises, 'readdir')
//       .mockResolvedValueOnce(['index.js', 'index.d.ts', 'utils'] as any)
//       .mockResolvedValueOnce(['foo.js'] as any);
//     await expect(resolveVersion('v0')).resolves.toMatchObject({
//       importPaths: ['/runtime/v0/index.js', '/runtime/v0/utils/foo.js'],
//       manifest: {
//         declarations: ['index.d.ts'],
//         sources: ['index.js', 'utils/foo.js']
//       },
//       version: 'v0'
//     });
//   });
// });

describe('plugin', () => {
  let result: any;

  beforeAll(async () => {
    result = await plugin();
  });

  it('should return false if disabled', async () => {
    await expect(plugin({ disabled: true })).resolves.toBe(false);
  });

  describe('config', () => {
    it('should exclude the runtime import paths for optimizeDeps', () => {
      const config = result.config();
      expect(config).toMatchObject({
        optimizeDeps: {
          exclude: expect.any(Array)
        }
      });
      expect(config.optimizeDeps.exclude.every((s: any) => typeof s === 'string' && s.startsWith('/runtime')));
    });
  });
});
