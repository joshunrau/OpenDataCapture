import { beforeAll, describe, expect, it } from 'vitest';

import { plugin } from '../plugin';

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
