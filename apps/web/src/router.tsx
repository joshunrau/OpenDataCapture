/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { ErrorPage } from '@opendatacapture/react-core';
import { createRouter } from '@tanstack/react-router';

import { LoadingFallback } from './components/LoadingFallback';
import { routeTree } from './route-tree';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({
  defaultErrorComponent: ErrorPage,
  defaultPendingComponent: LoadingFallback,
  routeTree
});
