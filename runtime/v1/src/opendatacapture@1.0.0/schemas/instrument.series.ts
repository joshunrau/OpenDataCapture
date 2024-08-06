import { z } from '../../zod@3.23.6';
import { $BaseInstrument, $ScalarInstrumentInternal } from './instrument.base';

import type { Merge } from '../../type-fest@4.23.0';
import type { Language } from './core';
import type { BaseInstrument, InstrumentLanguage, ScalarInstrumentInternal } from './instrument.base';

type SeriesInstrument<TLanguage extends InstrumentLanguage = InstrumentLanguage> = Merge<
  BaseInstrument<TLanguage>,
  {
    content: ScalarInstrumentInternal[];
    kind: 'SERIES';
  }
>;

type UnilingualSeriesInstrument = SeriesInstrument<Language>;
type MultilingualSeriesInstrument = SeriesInstrument<Language[]>;

const $SeriesInstrument: z.ZodType<SeriesInstrument> = $BaseInstrument.extend({
  content: z.array($ScalarInstrumentInternal),
  kind: z.literal('SERIES')
});

export { $SeriesInstrument };
export type { MultilingualSeriesInstrument, SeriesInstrument, UnilingualSeriesInstrument };
