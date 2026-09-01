import type {
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormInstrument
} from '@opendatacapture/runtime-core';
import { describe, expect, it } from 'vitest';
import { z as z3 } from 'zod/v3';
import { z } from 'zod/v4';

import { InstrumentSerializationError } from '../errors.js';
import { serializeInstrument } from '../serialize.js';

function createUnilingualForm(overrides: Partial<AnyUnilingualFormInstrument> = {}): AnyUnilingualFormInstrument {
  return {
    __runtimeVersion: 1,
    content: {
      favoriteNumber: {
        kind: 'number',
        label: 'Favorite Number',
        variant: 'input'
      }
    },
    details: {
      description: 'A form',
      license: 'Apache-2.0',
      title: 'Example Form'
    },
    internal: {
      edition: 1,
      name: 'EXAMPLE_FORM'
    },
    kind: 'FORM',
    language: 'en',
    measures: null,
    tags: ['Example'],
    validationSchema: z.object({ favoriteNumber: z.number() }),
    ...overrides
  };
}

describe('serializeInstrument', () => {
  it('should return a value that survives a JSON round trip unchanged, which is the whole contract', () => {
    const serialized = serializeInstrument(createUnilingualForm(), { language: 'en' });
    expect(JSON.parse(JSON.stringify(serialized))).toStrictEqual(serialized);
  });

  it('should resolve a multilingual instrument into the requested language, so no dict repr reaches the output', () => {
    const form = {
      ...createUnilingualForm(),
      content: {
        favoriteNumber: {
          kind: 'number',
          label: { en: 'Favorite Number', fr: 'Numéro préféré' },
          options: { en: { 1: 'One' }, fr: { 1: 'Un' } },
          variant: 'radio'
        }
      },
      details: {
        description: { en: 'A form', fr: 'Un formulaire' },
        license: 'Apache-2.0',
        title: { en: 'Example Form', fr: 'Formulaire exemple' }
      },
      language: ['en', 'fr'],
      tags: { en: ['Example'], fr: ['Exemple'] }
    } as unknown as AnyMultilingualFormInstrument;

    const serialized = serializeInstrument(form, { language: 'fr' });
    type RadioNumberField = Extract<FormInstrument.NumberField<'fr'>, { variant: 'radio' | 'select' }>;
    const field = (serialized.content as { [key: string]: RadioNumberField }).favoriteNumber!;

    expect(field.label).toBe('Numéro préféré');
    expect(field.options).toStrictEqual({ 1: 'Un' });
    expect(serialized.details.title).toBe('Formulaire exemple');
    expect(serialized.tags).toStrictEqual(['Exemple']);
  });

  it('should emit validationSchema as JSON Schema, so required fields survive the export', () => {
    const serialized = serializeInstrument(
      createUnilingualForm({
        validationSchema: z.object({
          favoriteNumber: z.number().min(0),
          note: z.string().optional()
        })
      }),
      { language: 'en' }
    );
    expect(serialized.validationSchema).toMatchObject({
      properties: {
        favoriteNumber: { minimum: 0, type: 'number' },
        note: { type: 'string' }
      },
      required: ['favoriteNumber'],
      type: 'object'
    });
  });

  it('should serialize grouped content, because a long form is authored as an array of groups', () => {
    const serialized = serializeInstrument(
      createUnilingualForm({
        content: [
          {
            fields: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } },
            title: 'Preferences'
          }
        ]
      }),
      { language: 'en' }
    );
    expect(serialized.content).toStrictEqual([
      {
        description: undefined,
        fields: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } },
        title: 'Preferences'
      }
    ]);
  });

  it('should serialize a record-array fieldset, which holds fields of its own', () => {
    const serialized = serializeInstrument(
      createUnilingualForm({
        content: {
          history: {
            fieldset: { condition: { kind: 'string', label: 'Condition', variant: 'input' } },
            kind: 'record-array',
            label: 'Medical History'
          }
        }
      }),
      { language: 'en' }
    );
    expect(serialized.content).toMatchObject({
      history: { fieldset: { condition: { kind: 'string' } } }
    });
  });

  it('should accept one options object shared by several fields, which is reuse rather than a cycle', () => {
    const options = { no: 'No', yes: 'Yes' };
    const serialized = serializeInstrument(
      createUnilingualForm({
        content: {
          first: { kind: 'string', label: 'First', options, variant: 'radio' },
          second: { kind: 'string', label: 'Second', options, variant: 'radio' }
        }
      }),
      { language: 'en' }
    );
    expect(serialized.content).toMatchObject({ first: { options }, second: { options } });
  });

  it('should drop measures rather than fail on them, as they describe scoring rather than questions', () => {
    const serialized = serializeInstrument(
      createUnilingualForm({
        measures: {
          doubled: { kind: 'computed', label: 'Doubled', value: (data: any) => data.favoriteNumber * 2 }
        }
      }),
      { language: 'en' }
    );
    expect(serialized).not.toHaveProperty('measures');
  });
});

describe('serializeInstrument violations', () => {
  function violationsOf(form: AnyUnilingualFormInstrument) {
    try {
      serializeInstrument(form, { language: 'en' });
    } catch (error) {
      if (error instanceof InstrumentSerializationError) {
        return error.violations;
      }
      throw error;
    }
    return expect.fail('expected serializeInstrument to throw');
  }

  it('should reject a dynamic field, naming its path so the author knows which field to rewrite', () => {
    const violations = violationsOf(
      createUnilingualForm({
        content: {
          reason: { deps: ['favoriteNumber'], kind: 'dynamic', render: () => null }
        }
      })
    );
    expect(violations).toStrictEqual([{ path: 'content.reason', reason: expect.stringContaining('dynamic field') }]);
  });

  it('should reject a dynamic field nested inside a record-array fieldset', () => {
    const violations = violationsOf(
      createUnilingualForm({
        content: {
          history: {
            fieldset: { condition: { kind: 'dynamic', render: () => null } },
            kind: 'record-array',
            label: 'Medical History'
          }
        }
      })
    );
    expect(violations).toStrictEqual([
      { path: 'content.history.fieldset.condition', reason: expect.stringContaining('dynamic field') }
    ]);
  });

  it('should reject a block, since its render function is arbitrary JSX', () => {
    const violations = violationsOf(
      createUnilingualForm({
        content: [{ kind: 'block', render: () => null }]
      })
    );
    expect(violations).toStrictEqual([{ path: 'content[0]', reason: expect.stringContaining('block') }]);
  });

  it('should reject a zod v3 validation schema, pointing the author at the v4 import', () => {
    const violations = violationsOf(
      createUnilingualForm({ validationSchema: z3.object({ favoriteNumber: z3.number() }) })
    );
    expect(violations).toStrictEqual([
      { path: 'validationSchema', reason: expect.stringContaining('/runtime/v1/zod@3.x/v4') }
    ]);
  });

  it('should report every violation at once, so an author does not fix them one run at a time', () => {
    const violations = violationsOf(
      createUnilingualForm({
        content: {
          one: { deps: [], kind: 'dynamic', render: () => null },
          two: { deps: [], kind: 'dynamic', render: () => null }
        },
        validationSchema: z3.object({})
      })
    );
    expect(violations.map(({ path }) => path)).toStrictEqual(['content.one', 'content.two', 'validationSchema']);
  });

  it('should catch a non-JSON value the field walk does not know about, such as a Date', () => {
    const violations = violationsOf(createUnilingualForm({ initialValues: { startedAt: new Date() } }));
    expect(violations).toStrictEqual([
      { path: 'initialValues.startedAt', reason: expect.stringContaining("instance of 'Date'") }
    ]);
  });

  it('should reject a validationSchema containing z.set, which zod cannot express as JSON Schema', () => {
    const violations = violationsOf(
      createUnilingualForm({ validationSchema: z.object({ symptoms: z.set(z.string()) }) })
    );
    expect(violations).toStrictEqual([
      { path: 'validationSchema', reason: expect.stringContaining('Set cannot be represented') }
    ]);
  });

  it('should detect a genuine cycle rather than recursing forever', () => {
    const initialValues: { self?: unknown } = {};
    initialValues.self = initialValues;
    const violations = violationsOf(createUnilingualForm({ initialValues: initialValues as any }));
    expect(violations).toStrictEqual([{ path: 'initialValues.self', reason: expect.stringContaining('circular') }]);
  });

  it('should refuse a non-form instrument, which has no field structure to convert', () => {
    expect(() => serializeInstrument({ ...createUnilingualForm(), kind: 'SERIES' } as any, { language: 'en' })).toThrow(
      /only forms/
    );
  });
});
