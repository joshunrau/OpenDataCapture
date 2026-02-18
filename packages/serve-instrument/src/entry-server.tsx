import React from 'react';
import { renderToString } from 'react-dom/server';

import { Root } from './Root';

import type { RootProps } from './Root';

export const render = (props: RootProps) => {
  return renderToString(
    <React.StrictMode>
      <Root {...props} />
    </React.StrictMode>
  );
};
