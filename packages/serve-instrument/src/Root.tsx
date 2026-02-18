import type React from 'react';
import { StrictMode } from 'react';

import { CoreProvider } from '@douglasneuroinformatics/libui/providers';
import { ScalarInstrumentRenderer } from '@opendatacapture/react-core';
import { decodeBase64ToUnicode } from '@opendatacapture/runtime-internal';

export type RootProps = {
  encodedBundle: string;
};

export const Root: React.FC<RootProps> = ({ encodedBundle }) => {
  return (
    <StrictMode>
      <CoreProvider>
        <div className="container h-screen py-16">
          <ScalarInstrumentRenderer
            target={{ bundle: decodeBase64ToUnicode(encodedBundle), id: null! }}
            onSubmit={({ data }) => {
              // eslint-disable-next-line no-alert
              alert(JSON.stringify({ _message: 'The following data will be submitted', data }, null, 2));
            }}
          />
        </div>
      </CoreProvider>
    </StrictMode>
  );
};
