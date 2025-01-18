import { z } from 'zod';

export const $Settings = z.object({
  apiBaseUrl: z.string().nullish(),
  enableVimMode: z.boolean().nullish(),
  refreshInterval: z.number().positive().int()
});

export type Settings = z.infer<typeof $Settings>;
