import { useTheme } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';

import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';

const RouteComponent = () => {
  const setupStateQuery = useSetupStateQuery();

  // since there is no theme toggle on the page, this is required to set the document attribute
  useTheme();

  return <div>Setup</div>;
};

export const Route = createFileRoute('/setup')({
  component: RouteComponent
});
