import type { HasNestedKey } from '@douglasneuroinformatics/libjs';
import type {
  BaseFormField,
  BooleanFormField,
  CompositeFieldValue,
  DateFormField,
  FieldsetValue,
  FormDataType,
  NumberFormField,
  NumberRecordFieldValue,
  NumberRecordFormField,
  PartialFormDataType,
  RecordArrayFieldValue,
  RecordArrayFormField,
  RequiredFieldValue,
  RequiredFormDataType,
  ScalarFieldValue,
  SetFormField,
  StaticFieldKind,
  StringFormField
} from '@douglasneuroinformatics/libui-form-types';
import type { KeysOfUnion, SetRequired, Simplify } from 'type-fest';
import { z } from 'zod';

import { $ZodTypeAny, type Language } from '../core/core.js';
import { $$InstrumentUIOption, $InstrumentDetails, $ScalarInstrument } from './instrument.base.js';

import type {
  InstrumentDetails,
  InstrumentLanguage,
  InstrumentMeasures,
  InstrumentUIOption,
  ScalarInstrument
} from './instrument.base.js';

const $StaticFieldKind: z.ZodType<StaticFieldKind> = z.enum([
  'string',
  'number',
  'boolean',
  'number-record',
  'record-array',
  'date',
  'set'
]);

/**
 * Utility type to implement one of the core field types defined in `@douglasneuroinformatics/libui-form-types`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TBase - the base field type that this field corresponds to
 * @typeParam TField - optional extensions to the multilingual base type, only applying to union members with the keys
 */
type FormInstrumentFieldMixin<
  TLanguage extends InstrumentLanguage,
  TBase extends BaseFormField,
  TField extends object = object
> = Simplify<
  TBase extends any
    ? Extract<keyof TField, string> extends Extract<keyof TBase, string>
      ? {
          description?: InstrumentUIOption<TLanguage, string>;
          label: InstrumentUIOption<TLanguage, string>;
        } & Omit<TBase, 'description' | 'label' | keyof TField> &
          TField
      : {
          description?: InstrumentUIOption<TLanguage, string>;
          label: InstrumentUIOption<TLanguage, string>;
        } & Omit<TBase, 'description' | 'label'>
    : never
>;
const $FormInstrumentBaseField = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  isRequired: z.boolean().optional(),
  kind: $StaticFieldKind,
  label: $$InstrumentUIOption(z.string().min(1))
}) satisfies z.ZodType<FormInstrumentFieldMixin<InstrumentLanguage, BaseFormField>>;

type FormInstrumentStringField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends string = string
> = FormInstrumentFieldMixin<
  TLanguage,
  StringFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;
const $FormInstrumentStringField: z.ZodType<FormInstrumentStringField> = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('string'),
    variant: z.enum(['input', 'password', 'textarea'])
  })
]);

type FormInstrumentNumberField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends number = number
> = FormInstrumentFieldMixin<
  TLanguage,
  NumberFormField,
  {
    options: InstrumentUIOption<
      TLanguage,
      {
        [K in TValue]: string;
      }
    >;
  }
>;
const $FormInstrumentNumberField: z.ZodType<FormInstrumentNumberField> = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().int(),
    min: z.number().int(),
    variant: z.literal('slider')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    max: z.number().optional(),
    min: z.number().optional(),
    variant: z.literal('input')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('number'),
    options: $$InstrumentUIOption(z.record(z.string().min(1))),
    variant: z.enum(['radio', 'select'])
  })
]);

type FormInstrumentDateField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  DateFormField
>;
const $FormInstrumentDateField: z.ZodType<FormInstrumentDateField> = $FormInstrumentBaseField.extend({
  kind: z.literal('date')
});

type FormInstrumentBooleanField<TLanguage extends InstrumentLanguage = InstrumentLanguage> = FormInstrumentFieldMixin<
  TLanguage,
  BooleanFormField,
  {
    options?: InstrumentUIOption<
      TLanguage,
      {
        false: string;
        true: string;
      }
    >;
  }
>;
const $FormInstrumentBooleanField: z.ZodType<FormInstrumentBooleanField> = z.union([
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    variant: z.literal('checkbox')
  }),
  $FormInstrumentBaseField.extend({
    kind: z.literal('boolean'),
    options: $$InstrumentUIOption(
      z.object({
        false: z.string().min(1),
        true: z.string().min(1)
      })
    ).optional(),
    variant: z.literal('radio')
  })
]);

type FormInstrumentSetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends Set<string> = Set<string>
> = FormInstrumentFieldMixin<
  TLanguage,
  SetFormField<TValue>,
  {
    options: TValue extends Set<infer TItem extends string>
      ? InstrumentUIOption<
          TLanguage,
          {
            [K in TItem]: string;
          }
        >
      : never;
  }
>;
const $FormInstrumentSetField: z.ZodType<FormInstrumentSetField> = $FormInstrumentBaseField.extend({
  kind: z.literal('set'),
  options: $$InstrumentUIOption(z.record(z.string().min(1))),
  variant: z.enum(['listbox', 'select'])
});

type AnyFormInstrumentScalarField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentBooleanField<TLanguage>
  | FormInstrumentDateField<TLanguage>
  | FormInstrumentNumberField<TLanguage>
  | FormInstrumentSetField<TLanguage>
  | FormInstrumentStringField<TLanguage>;

/**
 * Conditional type representing a static field corresponding for a `ScalarFieldValue`
 *
 * @typeParam TLanguage - the language(s) of the instrument
 * @typeParam TValue - the value corresponding to this field in `FormDataType`, excluding undefined
 */
type FormInstrumentScalarField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue<ScalarFieldValue> = RequiredFieldValue<ScalarFieldValue>
> = [TValue] extends [object]
  ? [TValue] extends [Date]
    ? FormInstrumentDateField<TLanguage>
    : [TValue] extends [Set<string>]
      ? FormInstrumentSetField<TLanguage, TValue>
      : never
  : [TValue] extends [string]
    ? FormInstrumentStringField<TLanguage, TValue>
    : [TValue] extends [number]
      ? FormInstrumentNumberField<TLanguage, TValue>
      : [TValue] extends [boolean]
        ? FormInstrumentBooleanField<TLanguage>
        : AnyFormInstrumentScalarField<TLanguage>;

const $FormInstrumentScalarField: z.ZodType<FormInstrumentScalarField> = z.union([
  $FormInstrumentDateField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentNumberField,
  $FormInstrumentBooleanField
]);

type FormInstrumentDynamicFieldsetField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldsetValue extends FieldsetValue = FieldsetValue,
  TValue extends RequiredFieldValue<ScalarFieldValue> = RequiredFieldValue<ScalarFieldValue>
> = {
  kind: 'dynamic';
  render: (this: void, fieldset: Partial<TFieldsetValue>) => FormInstrumentScalarField<TLanguage, TValue> | null;
};
const $FormInstrumentDynamicFieldsetField: z.ZodType<FormInstrumentDynamicFieldsetField> = z.object({
  kind: z.literal('dynamic'),
  render: z.function().args(z.any()).returns($FormInstrumentScalarField.nullable())
});

type FormInstrumentFieldset<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TFieldset extends { [key: string]: NonNullable<ScalarFieldValue> } = { [key: string]: NonNullable<ScalarFieldValue> }
> = {
  [K in keyof TFieldset]:
    | FormInstrumentDynamicFieldsetField<TLanguage, TFieldset, TFieldset[K]>
    | FormInstrumentScalarField<TLanguage, TFieldset[K]>;
};
const $FormInstrumentFieldset: z.ZodType<FormInstrumentFieldset> = z.record(
  z.union([$FormInstrumentDynamicFieldsetField, $FormInstrumentScalarField])
);

type FormInstrumentRecordArrayField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue<RecordArrayFieldValue> = RequiredFieldValue<RecordArrayFieldValue>
> = FormInstrumentFieldMixin<
  TLanguage,
  RecordArrayFormField<TValue>,
  {
    fieldset: FormInstrumentFieldset<TLanguage, TValue[number]>;
  }
>;
const $FormInstrumentRecordArrayField: z.ZodType<FormInstrumentRecordArrayField> = $FormInstrumentBaseField.extend({
  fieldset: $FormInstrumentFieldset,
  kind: z.literal('record-array')
});

type FormInstrumentNumberRecordField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue<NumberRecordFieldValue> = RequiredFieldValue<NumberRecordFieldValue>
> = FormInstrumentFieldMixin<
  TLanguage,
  NumberRecordFormField,
  {
    items: {
      [K in keyof TValue]: {
        description?: InstrumentUIOption<TLanguage, string>;
        label: InstrumentUIOption<TLanguage, string>;
      };
    };
    kind: 'number-record';
    options: InstrumentUIOption<
      TLanguage,
      {
        [key: number]: string;
      }
    >;
    variant: 'likert';
  }
>;
const $FormInstrumentNumberRecordField: z.ZodType<FormInstrumentNumberRecordField> = $FormInstrumentBaseField.extend({
  items: z.record(
    z.object({
      description: $$InstrumentUIOption(z.string()).optional(),
      label: $$InstrumentUIOption(z.string())
    })
  ),
  kind: z.literal('number-record'),
  options: $$InstrumentUIOption(z.record(z.coerce.number(), z.string())),
  variant: z.literal('likert')
});

type FormInstrumentCompositeField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue<CompositeFieldValue> = RequiredFieldValue<CompositeFieldValue>
> =
  TValue extends RequiredFieldValue<RecordArrayFieldValue>
    ? FormInstrumentRecordArrayField<TLanguage, TValue>
    : TValue extends RequiredFieldValue<NumberRecordFieldValue>
      ? FormInstrumentNumberRecordField<TLanguage, TValue>
      : never;

const $FormInstrumentCompositeField: z.ZodType<FormInstrumentCompositeField> = z.union([
  $FormInstrumentRecordArrayField,
  $FormInstrumentNumberRecordField
]);

type AnyFormInstrumentStaticField<TLanguage extends InstrumentLanguage = InstrumentLanguage> =
  | FormInstrumentBooleanField<TLanguage>
  | FormInstrumentDateField<TLanguage>
  | FormInstrumentNumberField<TLanguage>
  | FormInstrumentNumberRecordField<TLanguage>
  | FormInstrumentRecordArrayField<TLanguage>
  | FormInstrumentSetField<TLanguage>
  | FormInstrumentStringField<TLanguage>;

type FormInstrumentStaticField<
  TLanguage extends InstrumentLanguage = InstrumentLanguage,
  TValue extends RequiredFieldValue = RequiredFieldValue
> = [TValue] extends [RequiredFieldValue<ScalarFieldValue>]
  ? FormInstrumentScalarField<TLanguage, TValue>
  : [TValue] extends [RequiredFieldValue<CompositeFieldValue>]
    ? [TValue] extends [RequiredFieldValue<RecordArrayFieldValue>]
      ? FormInstrumentRecordArrayField<TLanguage, TValue>
      : [TValue] extends [RequiredFieldValue<NumberRecordFieldValue>]
        ? FormInstrumentNumberRecordField<TLanguage, TValue>
        : never
    : AnyFormInstrumentStaticField<TLanguage>;

const $FormInstrumentStaticField: z.ZodType<FormInstrumentStaticField> = z.union([
  $FormInstrumentCompositeField,
  $FormInstrumentScalarField
]);

type FormInstrumentDynamicField<
  TData extends FormDataType = FormDataType,
  TValue extends RequiredFieldValue = RequiredFieldValue,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  deps: readonly Extract<keyof TData, string>[];
  kind: 'dynamic';
  render: (this: void, data: PartialFormDataType<TData>) => FormInstrumentStaticField<TLanguage, TValue> | null;
};
const $FormInstrumentDynamicField: z.ZodType<FormInstrumentDynamicField> = z.object({
  deps: z.array(z.string()),
  kind: z.literal('dynamic'),
  render: z.function().args(z.any()).returns($FormInstrumentStaticField.nullable())
});

type AnyFormInstrumentField =
  | FormInstrumentBooleanField
  | FormInstrumentDateField
  | FormInstrumentDynamicField
  | FormInstrumentNumberField
  | FormInstrumentNumberRecordField
  | FormInstrumentRecordArrayField
  | FormInstrumentSetField
  | FormInstrumentStringField;

type FormInstrumentUnknownField<
  TData extends FormDataType = FormDataType,
  TKey extends keyof TData = keyof TData,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> =
  RequiredFormDataType<TData> extends infer TRequiredData extends RequiredFormDataType<TData>
    ?
        | FormInstrumentDynamicField<TData, TRequiredData[TKey], TLanguage>
        | FormInstrumentStaticField<TLanguage, TRequiredData[TKey]>
    : never;
const $FormInstrumentUnknownField: z.ZodType<FormInstrumentUnknownField> = z.union([
  $FormInstrumentDynamicField,
  $FormInstrumentStaticField
]);

type FormInstrumentFields<
  TData extends FormDataType = FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  [K in keyof TData]-?: FormInstrumentUnknownField<TData, K, TLanguage>;
};
const $FormInstrumentFields: z.ZodType<FormInstrumentFields> = z.record($FormInstrumentUnknownField);

type FormInstrumentFieldsGroup<
  TData extends FormDataType = FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = {
  description?: InstrumentUIOption<TLanguage, string>;
  fields: {
    [K in keyof TData]?: FormInstrumentUnknownField<TData, K, TLanguage>;
  };
  title?: InstrumentUIOption<TLanguage, string>;
};
const $FormInstrumentFieldsGroup = z.object({
  description: $$InstrumentUIOption(z.string().min(1)).optional(),
  fields: $FormInstrumentFields,
  title: $$InstrumentUIOption(z.string().min(1)).optional()
}) satisfies z.ZodType<FormInstrumentFieldsGroup>;

type FormInstrumentContent<
  TData extends FormDataType = FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = FormInstrumentFields<TData, TLanguage> | FormInstrumentFieldsGroup<TData, TLanguage>[];
const $FormInstrumentContent = z.union([
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup.array()
]) satisfies z.ZodType<FormInstrumentContent>;

type FormInstrument<
  TData extends FormDataType = FormDataType,
  TLanguage extends InstrumentLanguage = InstrumentLanguage
> = Simplify<
  {
    content: FormInstrumentContent<TData, TLanguage>;
    details: SetRequired<InstrumentDetails<TLanguage>, 'estimatedDuration'>;
    kind: 'FORM';
    measures: InstrumentMeasures<TData, TLanguage> | null;
  } & Omit<ScalarInstrument<TData, TLanguage>, 'details'>
>;
const $FormInstrument: z.ZodType<FormInstrument> = $ScalarInstrument.extend({
  content: $FormInstrumentContent,
  details: $InstrumentDetails.required({
    estimatedDuration: true
  }),
  kind: z.literal('FORM'),
  validationSchema: $ZodTypeAny
});

/**
 * Wrapper around `FormInstrument` that bans potentially confusing keys (e.g., 'kind') as field names
 */
type StrictFormInstrument<TData extends FormDataType, TLanguage extends InstrumentLanguage> =
  HasNestedKey<TData, KeysOfUnion<FormInstrumentStaticField>> extends false ? FormInstrument<TData, TLanguage> : never;

type AnyMultilingualFormInstrument = FormInstrument<FormDataType, Language[]>;

type AnyUnilingualFormInstrument = FormInstrument<FormDataType, Language>;

export {
  $FormInstrument,
  $FormInstrumentBooleanField,
  $FormInstrumentCompositeField,
  $FormInstrumentContent,
  $FormInstrumentDateField,
  $FormInstrumentDynamicField,
  $FormInstrumentFields,
  $FormInstrumentFieldsGroup,
  $FormInstrumentNumberField,
  $FormInstrumentNumberRecordField,
  $FormInstrumentSetField,
  $FormInstrumentStringField,
  $FormInstrumentUnknownField
};
export type {
  AnyFormInstrumentField,
  AnyFormInstrumentScalarField,
  AnyFormInstrumentStaticField,
  AnyMultilingualFormInstrument,
  AnyUnilingualFormInstrument,
  FormDataType,
  FormInstrument,
  FormInstrumentBooleanField,
  FormInstrumentCompositeField,
  FormInstrumentContent,
  FormInstrumentDateField,
  FormInstrumentDynamicField,
  FormInstrumentDynamicFieldsetField,
  FormInstrumentFields,
  FormInstrumentFieldsGroup,
  FormInstrumentFieldset,
  FormInstrumentNumberField,
  FormInstrumentNumberRecordField,
  FormInstrumentRecordArrayField,
  FormInstrumentScalarField,
  FormInstrumentSetField,
  FormInstrumentStaticField,
  FormInstrumentStringField,
  FormInstrumentUnknownField,
  StrictFormInstrument
};
