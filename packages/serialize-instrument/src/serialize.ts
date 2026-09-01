import { isZodType } from '@douglasneuroinformatics/libjs';
import { isFormInstrument, translateInstrument } from '@opendatacapture/instrument-utils';
import type { AnyInstrument, FormInstrument, Language } from '@opendatacapture/runtime-core';
import { match, P } from 'ts-pattern';
import { z } from 'zod/v4';

import { InstrumentSerializationError } from './errors.js';
import { collectNonJsonValues } from './json.js';

import type { SerializationViolation } from './errors.js';
import type {
  JSONSchema,
  SerializedContent,
  SerializedField,
  SerializedFieldset,
  SerializedFieldsGroup,
  SerializedFormInstrument,
  UnilingualFormField
} from './types.js';

const DYNAMIC_FIELD_REASON =
  "a dynamic field's 'render' is a function, so its conditional logic cannot be represented in JSON";

type SerializeInstrumentOptions = {
  /** The language a multilingual instrument is resolved into; a unilingual instrument ignores it */
  language: Language;
};

function serializeFieldset(
  fieldset: FormInstrument.Fieldset<Language>,
  path: string,
  violations: SerializationViolation[]
): SerializedFieldset {
  const serialized: SerializedFieldset = {};
  for (const key in fieldset) {
    const field = fieldset[key]!;
    if (field.kind === 'dynamic') {
      violations.push({ path: `${path}.${key}`, reason: DYNAMIC_FIELD_REASON });
      continue;
    }
    serialized[key] = field;
  }
  return serialized;
}

function serializeField(
  field: UnilingualFormField,
  path: string,
  violations: SerializationViolation[]
): null | SerializedField {
  return match(field)
    .with({ kind: 'dynamic' }, () => {
      violations.push({ path, reason: DYNAMIC_FIELD_REASON });
      return null;
    })
    .with({ kind: 'record-array' }, (recordArray) => ({
      ...recordArray,
      fieldset: serializeFieldset(recordArray.fieldset, `${path}.fieldset`, violations)
    }))
    .with(
      { kind: P.union('boolean', 'date', 'number', 'number-record', 'set', 'string') },
      (staticField) => staticField
    )
    .exhaustive();
}

function serializeFields(
  fields: Partial<FormInstrument.Fields<FormInstrument.Data, Language>>,
  path: string,
  violations: SerializationViolation[]
) {
  const serialized: { [key: string]: SerializedField } = {};
  for (const key in fields) {
    const field = fields[key];
    if (!field) {
      continue;
    }
    const serializedField = serializeField(field, `${path}.${key}`, violations);
    if (serializedField) {
      serialized[key] = serializedField;
    }
  }
  return serialized;
}

function serializeContent(
  content: FormInstrument.Content<FormInstrument.Data, Language>,
  violations: SerializationViolation[]
): SerializedContent {
  if (!Array.isArray(content)) {
    return serializeFields(content, 'content', violations);
  }
  const groups: SerializedFieldsGroup[] = [];
  content.forEach((item, index) => {
    const path = `content[${index}]`;
    if (item.kind === 'block') {
      violations.push({
        path,
        reason: "a block's 'render' is a function, so its content cannot be represented in JSON"
      });
      return;
    }
    groups.push({
      description: item.description,
      fields: serializeFields(item.fields, `${path}.fields`, violations),
      title: item.title
    });
  });
  return groups;
}

function serializeValidationSchema(validationSchema: unknown, violations: SerializationViolation[]): JSONSchema {
  if (!isZodType(validationSchema, { version: 4 })) {
    violations.push({
      path: 'validationSchema',
      reason: isZodType(validationSchema, { version: 3 })
        ? "written against the zod v3 API, which has no JSON Schema conversion — import z from '/runtime/v1/zod@3.x/v4'"
        : 'is not a zod schema'
    });
    return {};
  }
  try {
    return z.toJSONSchema(validationSchema, { io: 'input' });
  } catch (error) {
    violations.push({
      path: 'validationSchema',
      reason: `has no JSON Schema representation: ${error instanceof Error ? error.message : String(error)}`
    });
    return {};
  }
}

/**
 * Reduce a form instrument to plain JSON for consumption outside Open Data Capture.
 *
 * @param instrument - An interpreted instrument, unilingual or multilingual.
 * @param options.language - The language a multilingual instrument is resolved into.
 * @returns The instrument as JSON-safe data.
 * @throws {InstrumentSerializationError} If the instrument holds anything JSON cannot represent.
 */
function serializeInstrument(
  instrument: AnyInstrument,
  { language }: SerializeInstrumentOptions
): SerializedFormInstrument {
  const translated = translateInstrument(instrument, language);
  if (!isFormInstrument(translated)) {
    throw new Error(`Cannot serialize instrument of kind '${translated.kind}': only forms have a JSON representation`);
  }
  const violations: SerializationViolation[] = [];
  const { content, measures, validationSchema, ...rest } = translated;
  const serialized: SerializedFormInstrument = {
    ...rest,
    content: serializeContent(content, violations),
    validationSchema: serializeValidationSchema(validationSchema, violations)
  };
  collectNonJsonValues(serialized, '', violations);
  if (violations.length > 0) {
    throw new InstrumentSerializationError(translated.internal.name, violations);
  }
  return serialized;
}

export { serializeInstrument };
export type { SerializeInstrumentOptions };
