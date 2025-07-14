import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Login</div>;
};

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent
});
