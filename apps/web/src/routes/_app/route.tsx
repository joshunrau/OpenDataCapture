import { createFileRoute, redirect } from '@tanstack/react-router';

import { setupStateQueryOptions } from '@/hooks/useSetupStateQuery';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const setupState = await context.queryClient.ensureQueryData(setupStateQueryOptions());
    if (!setupState.isSetup) {
      throw redirect({ to: '/setup' });
    }
  }
});
