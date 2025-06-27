import { describe, expect, it } from 'vitest';

import { plugin } from '../plugin';

describe('plugin', () => {
  it('should return false if disabled', async () => {
    await expect(plugin({ disabled: true })).resolves.toBe(false);
  });
});
