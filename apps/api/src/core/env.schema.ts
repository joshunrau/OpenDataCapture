import { $BooleanLike, $NumberLike, $UrlLike } from '@douglasneuroinformatics/libjs';
import { $BaseEnv } from '@douglasneuroinformatics/libnest/config';
import { z } from 'zod';

export type Env = z.infer<typeof $Env>;
export const $Env = $BaseEnv
  .extend({
    GATEWAY_API_KEY: z.string().min(32),
    GATEWAY_DEV_SERVER_PORT: $NumberLike.pipe(z.number().positive().int()).optional(),
    GATEWAY_ENABLED: $BooleanLike,
    GATEWAY_INTERNAL_NETWORK_URL: $UrlLike.optional(),
    GATEWAY_REFRESH_INTERVAL: $NumberLike.pipe(z.number().positive().int()),
    GATEWAY_SITE_ADDRESS: $UrlLike.optional()
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (!env.GATEWAY_SITE_ADDRESS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'GATEWAY_SITE_ADDRESS must be defined in production'
        });
      }
    } else if (env.NODE_ENV === 'development') {
      if (!env.API_DEV_SERVER_PORT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'API_DEV_SERVER_PORT must be defined in development'
        });
      }
      if (!env.GATEWAY_DEV_SERVER_PORT) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'GATEWAY_DEV_SERVER_PORT must be defined in development'
        });
      }
    }
  });
