/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { defineUserConfig } from '@douglasneuroinformatics/libnest/user-config';
import { getReleaseInfo } from '@opendatacapture/release-info';

declare module '@douglasneuroinformatics/libnest/user-config' {
  type Config = typeof config.infer;
  export interface UserConfig extends Config {}
}

const config = defineUserConfig({
  entry: () => import('./src/main.js'),
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});

export default config;
