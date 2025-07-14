import { createFileRoute, redirect } from '@tanstack/react-router';

import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const setupState = await context.queryClient.fetchQuery(setupStateQueryOptions());
    if (!setupState.isSetup) {
      throw redirect({ to: '/setup' });
    }
    const { accessToken } = useAppStore.getState();
    if (!accessToken) {
      throw redirect({ to: '/auth/login' });
    }
  }
});
