import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Setup</div>;
};

export const Route = createFileRoute('/setup')({
  component: RouteComponent
});
