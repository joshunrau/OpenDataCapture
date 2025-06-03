/* eslint-disable */

import type { InstrumentKind, InstrumentLanguage, InstrumentSchemaVersion } from './types/instrument.base.js';
import type { FormInstrument } from './types/instrument.form.js';
import type { InteractiveInstrument } from './types/instrument.interactive.js';

type BaseInstrumentDef = {
  kind: InstrumentKind;
  language: InstrumentLanguage;
  schemaVersion: InstrumentSchemaVersion;
};

type DiscriminatedInstrument<
  TKind extends InstrumentKind,
  TLanguage extends InstrumentLanguage,
  TSchemaVersion extends InstrumentSchemaVersion,
  TData
> = [TKind] extends ['FORM']
  ? TData extends FormInstrument.Data
    ? FormInstrument<TData, TLanguage, TSchemaVersion>
    : never
  : [TKind] extends ['INTERACTIVE']
    ? TData extends InteractiveInstrument.Data
      ? InteractiveInstrument<TData, TLanguage, TSchemaVersion>
      : never
    : never;

type InstrumentDef<T> = BaseInstrumentDef &
  T &
  (NoInfer<T> extends {
    schemaVersion: infer TSchemaVersion extends InstrumentSchemaVersion;
  }
    ? { foo: `${TSchemaVersion}` }
    : unknown);

export function defineInstrument<T>(def: InstrumentDef<T>) {
  return;
}

defineInstrument({
  kind: 'FORM',
  language: 'en',
  schemaVersion: 1,
  foo: '1'
});

defineInstrument({
  kind: 'FORM',
  language: 'en',
  schemaVersion: 2,
  foo: '2'
});
