import { describe, expect, it } from 'vitest';

import { bilingualFormInstrument, unilingualFormInstrument } from '../../__stubs__/forms';
import { interactiveInstrument } from '../../__stubs__/interactive';
import { $AnyScalarInstrument } from '../instrument.core';

describe('$AnyScalarInstrument', () => {
  it('should parse a multilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(bilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a unilingual form instrument', () => {
    expect($AnyScalarInstrument.safeParse(unilingualFormInstrument.instance).success).toBe(true);
  });
  it('should parse a interactive instrument', () => {
    expect($AnyScalarInstrument.safeParse(interactiveInstrument.instance).success).toBe(true);
  });
});
