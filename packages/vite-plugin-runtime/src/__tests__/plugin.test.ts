import * as path from 'path';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { generateMetadataForVersion, plugin, RUNTIME_DIR, RUNTIME_DIST_DIRNAME } from '../plugin';

const fs = vi.hoisted(() => ({
  existsSync: vi.fn().mockReturnValue(true),
  lstatSync: vi.fn().mockImplementation((filepath: string) => ({
    isDirectory: () => !filepath.split('/').at(-1)!.includes('.')
  })),
  promises: {
    cp: vi.fn(),
    readdir: vi.fn().mockImplementation((filepath: string) => {
      if (filepath === RUNTIME_DIR) {
        return ['v1', '.DS_Store'];
      } else if (filepath === path.join(RUNTIME_DIR, 'v1', RUNTIME_DIST_DIRNAME)) {
        return ['@opendatacapture'];
      } else if (filepath.endsWith('@opendatacapture')) {
        return ['runtime-core'];
      } else if (filepath.endsWith('runtime-core')) {
        return ['index.js', 'index.d.ts', 'styles'];
      } else if (filepath.endsWith('styles')) {
        return ['index.css'];
      }
      throw new Error(`Unexpected filepath for test mock: ${filepath}`);
    }),
    writeFile: vi.fn()
  }
}));

vi.mock('fs', () => fs);

describe('generateMetadataForVersion', () => {
  it('should throw if the resolved baseDir does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    await expect(() => generateMetadataForVersion('v0')).rejects.toThrow('Not a directory');
  });

  it('should throw if the resolved baseDir is not a directory', async () => {
    fs.lstatSync.mockReturnValueOnce({ isDirectory: () => false });
    await expect(() => generateMetadataForVersion('v0')).rejects.toThrow('Not a directory');
  });
});

describe('plugin', () => {
  let result: any;

  beforeAll(async () => {
    result = await plugin();
  });

  it('should return false if disabled', async () => {
    await expect(plugin({ disabled: true })).resolves.toBe(false);
  });

  describe('buildStart', () => {
    it('should copy the runtime dist and the manifest to the output dir', async () => {
      await result.buildStart();
      const destination = path.join(process.cwd(), 'dist/runtime/v1');
      expect(fs.promises.cp).toHaveBeenCalledOnce();
      expect(fs.promises.cp).toHaveBeenLastCalledWith(path.join(RUNTIME_DIR, 'v1', RUNTIME_DIST_DIRNAME), destination, {
        recursive: true
      });
      expect(fs.promises.writeFile).toHaveBeenCalledOnce();
      expect(fs.promises.writeFile).toHaveBeenLastCalledWith(expect.any(String), expect.any(String), 'utf-8');
      const manifest = JSON.parse(fs.promises.writeFile.mock.lastCall![1] as string);
      expect(manifest).toStrictEqual({
        declarations: ['@opendatacapture/runtime-core/index.d.ts'],
        sources: ['@opendatacapture/runtime-core/index.js'],
        styles: ['@opendatacapture/runtime-core/styles/index.css']
      });
    });
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
