import { $BooleanLike, $NumberLike } from '@douglasneuroinformatics/libjs';
import { $BaseEnv } from 'node_modules/@douglasneuroinformatics/libnest/dist/config/schema';
import { z } from 'zod';

export type Config = z.infer<typeof $Config>;
export const $Config = $BaseEnv.extend({
  GATEWAY_API_KEY: z.string().min(32),
  GATEWAY_DEV_SERVER_PORT: $NumberLike.pipe(z.number().positive().int()).optional(),
  GATEWAY_ENABLED: $BooleanLike
  // GATEWAY_INTERNAL_NETWORK_URL: $ParsedURL.optional(),
  // GATEWAY_REFRESH_INTERVAL: $ParsedNumber(z.number().positive().int()),
  // GATEWAY_SITE_ADDRESS: $ParsedURL.optional()
});
