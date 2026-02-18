/* eslint-disable @typescript-eslint/consistent-type-definitions */

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from './Root';

import type { RootProps } from './Root';

declare global {
  interface Window {
    __ROOT_PROPS__: RootProps;
  }
}

const ROOT_PROPS = window.__ROOT_PROPS__;

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <Root {...ROOT_PROPS} />
  </React.StrictMode>
);
