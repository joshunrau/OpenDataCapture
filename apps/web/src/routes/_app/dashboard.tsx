import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Dashboard</div>;
};

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent
});
