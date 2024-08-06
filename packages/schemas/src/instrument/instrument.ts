import { z } from 'zod';

export type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
export const $CreateInstrumentData = z.object({
  bundle: z.string().min(1)
});

export type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;
export const $InstrumentBundleContainer = z.object({
  bundle: z.string(),
  id: z.string()
});
