import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { ErrorPage, LoadingPage } from '@opendatacapture/react-core';
import { ErrorBoundary } from 'react-error-boundary';

const DatabaseProvider = React.lazy(() => import('./providers/DatabaseProvider'));
const IndexPage = React.lazy(() => import('./pages/IndexPage'));

export const App = () => {
  return (
    <React.Suspense
      fallback={
        <LoadingPage subtitle="Please Be Patient, This May Take a While" title="Loading Editor and Toolchain" />
      }
    >
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <DatabaseProvider>
          <NotificationHub />
          <IndexPage />
        </DatabaseProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
