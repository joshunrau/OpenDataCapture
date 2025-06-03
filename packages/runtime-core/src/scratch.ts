/* eslint-disable */

import type { InstrumentKind, InstrumentLanguage, InstrumentSchemaVersion } from './types/instrument.base.js';

type BaseInstrumentDef = {
  kind: InstrumentKind;
  language: InstrumentLanguage;
  schemaVersion: InstrumentSchemaVersion;
};

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
