import { z } from '@opendatacapture/runtime-v1/zod@3.23.6/index.js';

export type CreateInstrumentData = z.infer<typeof $CreateInstrumentData>;
export const $CreateInstrumentData = z.object({
  bundle: z.string().min(1)
});

export type InstrumentBundleContainer = z.infer<typeof $InstrumentBundleContainer>;
export const $InstrumentBundleContainer = z.object({
  bundle: z.string(),
  id: z.string()
});

export * from '@opendatacapture/runtime-v1/opendatacapture@1.0.0/schemas/instrument.js';
