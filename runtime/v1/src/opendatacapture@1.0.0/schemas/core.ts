import { z } from '../../zod@3.23.6';

type Language = z.infer<typeof $Language>;
const $Language = z.enum(['en', 'fr']);

type JsonLiteral = z.infer<typeof $JsonLiteral>;
const $JsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Json = { [key: string]: Json } | Json[] | JsonLiteral;
const $Json: z.ZodType<Json> = z.lazy(() => z.union([$JsonLiteral, z.array($Json), z.record($Json)]));

export { $Json, $Language };
export type { Json, Language };
