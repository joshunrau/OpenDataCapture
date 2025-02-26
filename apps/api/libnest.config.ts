/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { defineConfig } from '@douglasneuroinformatics/libnest/config';
import { getReleaseInfo } from '@opendatacapture/release-info';

import type { Config } from '@/config';

declare module '@douglasneuroinformatics/libnest/config' {
  export interface RuntimeEnv extends Config {}
}

export default defineConfig({
  entry: 'src/main.ts',
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});
