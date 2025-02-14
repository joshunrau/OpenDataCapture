import { $BooleanLike } from '@douglasneuroinformatics/libjs';
import { $BaseRuntimeConfig } from '@douglasneuroinformatics/libnest/config';
import type { z } from 'zod';

export type Config = z.infer<typeof $Config>;
export const $Config = $BaseRuntimeConfig.extend({
  DANGEROUSLY_DISABLE_PBKDF2_ITERATION: $BooleanLike
});
