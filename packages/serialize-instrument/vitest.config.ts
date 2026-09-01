import { defineProject, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

export default mergeConfig(
  baseConfig,
  defineProject({
    test: {
      name: 'serialize-instrument',
      root: import.meta.dirname
    }
  })
);
