/* eslint-disable */

import type { InstrumentSchemaVersion } from './types/instrument.base.js';

type Base = {
  schemaVersion: InstrumentSchemaVersion;
};

type InstrumentDef<T> = Base &
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
  schemaVersion: 1,
  foo: '1'
});
