/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { defineConfig } from '@douglasneuroinformatics/libnest/config';
import { getReleaseInfo } from '@opendatacapture/release-info';

declare module '@douglasneuroinformatics/libnest/config' {
  type Config = typeof config.infer;
  export interface RuntimeConfig extends Config {}
}

const config = defineConfig({
  entry: () => import('./src/main.js'),
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});

export default config;
