import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Hello "/_app/admin/users/create"!</div>;
};

export const Route = createFileRoute('/_app/admin/users/create')({
  component: RouteComponent
});
