import React from 'react';

import { NotificationHub } from '@douglasneuroinformatics/libui/components';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';

import { Routes } from '@/Routes';
import { queryClient } from '@/services/react-query';

import { SetupProvider } from './features/setup';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationHub />
      <SetupProvider>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </SetupProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
