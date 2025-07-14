import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Start Session</div>;
};

export const Route = createFileRoute('/_app/session/start-session')({
  component: RouteComponent
});
