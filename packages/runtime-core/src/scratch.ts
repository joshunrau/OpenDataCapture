/* eslint-disable */

import type { InstrumentSchemaVersion } from './types/instrument.base.js';

type Base = {
  schemaVersion: InstrumentSchemaVersion;
};

type InstrumentDef<T> = Base &
  T &
  (NoInfer<T> extends {
    schemaVersion: InstrumentSchemaVersion;
  }
    ? { foo: `${T['schemaVersion']}` }
    : unknown);

export function defineInstrument<T>(def: InstrumentDef<T>) {
  return;
}

defineInstrument({
  schemaVersion: 2,
  foo: '2'
});
