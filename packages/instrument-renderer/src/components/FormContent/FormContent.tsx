import React from 'react';

import { Form, Heading } from '@douglasneuroinformatics/libui/components';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/schemas/instrument';
import type { Promisable } from 'type-fest';

import type { FormDataType } from '@opendatacapture/runtime-v1/@douglasneuroinformatics/libui-form-types@0.x/index.js';

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (data: FormDataType) => Promisable<void>;
};

export const FormContent = ({ instrument, onSubmit }: FormContentProps) => {
  return (
    <div className="space-y-6">
      <Heading variant="h4">{instrument.details.title}</Heading>
      <Form
        preventResetValuesOnReset
        content={instrument.content}
        data-cy="form-content"
        validationSchema={instrument.validationSchema}
        onSubmit={(data) => void onSubmit(data)}
      />
    </div>
  );
};
