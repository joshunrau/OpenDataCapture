import { defineConfig } from '@douglasneuroinformatics/libnest';
import { getReleaseInfo } from '@opendatacapture/release-info';

export default defineConfig({
  entry: 'src/main.ts',
  globals: {
    __RELEASE__: await getReleaseInfo()
  }
});
