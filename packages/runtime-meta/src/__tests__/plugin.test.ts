import * as path from 'path';

import { describe, expect, it, vi } from 'vitest';

import { generateMetadataForVersion, RUNTIME_DIR, RUNTIME_DIST_DIRNAME } from '../index.js';

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
    readFile: vi.fn(),
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
