/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { defineUserConfig } from '@douglasneuroinformatics/libnest/user-config';
import { getReleaseInfo } from '@opendatacapture/release-info';

import type { Config } from '@/config';

declare module '@douglasneuroinformatics/libnest/user-config' {
  export interface RuntimeConfig extends Config {}
}

export default defineUserConfig({
  entry: 'src/main.ts',
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});
