import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>About</div>;
};

export const Route = createFileRoute('/_app/about')({
  component: RouteComponent
});
