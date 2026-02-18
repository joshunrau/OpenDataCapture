import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';

import type { RootProps } from './Root';

declare global {
  const __ROOT_PROPS__: RootProps;
}

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...__ROOT_PROPS__} />
  </React.StrictMode>
);
