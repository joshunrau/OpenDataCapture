import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>User</div>;
};

export const Route = createFileRoute('/_app/user')({
  component: RouteComponent
});
