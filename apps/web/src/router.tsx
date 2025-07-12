/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { createRouter } from '@tanstack/react-router';

import { routeTree } from './route-tree';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({ routeTree });
