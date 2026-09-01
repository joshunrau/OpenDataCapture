import type { AnyUnilingualFormInstrument, FormInstrument, Language } from '@opendatacapture/runtime-core';
import type { Merge, Simplify } from 'type-fest';
import type { z } from 'zod/v4';

/** The JSON Schema document `z.toJSONSchema` produces for a single schema */
type JSONSchema = z.core.JSONSchema.BaseSchema;

/** A field as it appears in translated content, before serialization removes the dynamic members */
type UnilingualFormField = FormInstrument.Fields<FormInstrument.Data, Language>[string];

/** A record-array fieldset with its dynamic (function-valued) members removed */
type SerializedFieldset = {
  [key: string]: FormInstrument.ScalarField<Language>;
};

type SerializedRecordArrayField = Merge<FormInstrument.RecordArrayField<Language>, { fieldset: SerializedFieldset }>;

/**
 * Every field kind that survives serialization — `FormInstrument.AnyStaticField` with the
 * record-array fieldset narrowed. The exhaustive `match` in `serialize.ts` is what keeps this in
 * step with `runtime-core`: a new field kind fails to compile there before it can reach here.
 */
type SerializedField =
  | FormInstrument.BooleanField<Language>
  | FormInstrument.DateField<Language>
  | FormInstrument.NumberField<Language>
  | FormInstrument.NumberRecordField<Language>
  | FormInstrument.SetField<Language>
  | FormInstrument.StringField<Language>
  | SerializedRecordArrayField;

type SerializedFieldsGroup = {
  description?: string;
  fields: { [key: string]: SerializedField };
  title?: string;
};

type SerializedContent = SerializedFieldsGroup[] | { [key: string]: SerializedField };

/**
 * A form instrument reduced to JSON: resolved to one language, with every function removed and
 * `validationSchema` expressed as JSON Schema instead of as a zod schema.
 *
 * Measures are not part of the format. They describe how to derive a score from a completed record,
 * which is a concern of the instrument runtime rather than of the questions the instrument asks.
 */
type SerializedFormInstrument = Simplify<
  Omit<AnyUnilingualFormInstrument, 'content' | 'measures' | 'validationSchema'> & {
    content: SerializedContent;
    validationSchema: JSONSchema;
  }
>;

export type {
  JSONSchema,
  SerializedContent,
  SerializedField,
  SerializedFieldset,
  SerializedFieldsGroup,
  SerializedFormInstrument,
  UnilingualFormField
};
