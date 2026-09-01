import { describe, expect, it } from 'vitest';

import { resolveRuntimeImport } from '../runtime.js';

describe('resolveRuntimeImport', () => {
  // The resolution itself calls `import.meta.resolve`, which vitest's module runner does not
  // implement, so only the guard is covered here. The CLI exercises the rest.
  it('should reject a specifier outside the runtime, since a bundle may import nothing else', () => {
    expect(() => resolveRuntimeImport('node:fs')).toThrow(/Unexpected non-runtime import/);
  });
});
