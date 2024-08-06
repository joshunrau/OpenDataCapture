import { z } from '../../zod@3.23.6';
import { licenses } from '../licenses';
import { isZodType } from '../utils';

import type { LicenseIdentifier } from '../licenses';

type Language = z.infer<typeof $Language>;
const $Language = z.enum(['en', 'fr']);

type JsonLiteral = z.infer<typeof $JsonLiteral>;
const $JsonLiteral = z.union([z.string(), z.number(), z.boolean(), z.null()]);

type Json = { [key: string]: Json } | Json[] | JsonLiteral;
const $Json: z.ZodType<Json> = z.lazy(() => z.union([$JsonLiteral, z.array($Json), z.record($Json)]));

const $LicenseIdentifier = z.string().refine((arg) => licenses.has(arg as LicenseIdentifier)) as z.ZodType<
  LicenseIdentifier,
  z.ZodTypeDef,
  LicenseIdentifier
>;

const $ZodTypeAny = z.custom<z.ZodTypeAny>((arg) => isZodType(arg));

export { $Json, $Language, $LicenseIdentifier, $ZodTypeAny };
export type { Json, Language };
