import { defineUserConfig } from '@douglasneuroinformatics/libnest/user-config';
import { getReleaseInfo } from '@opendatacapture/release-info';

export default defineUserConfig({
  entry: 'src/main.ts',
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});
