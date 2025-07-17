import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return <div>Hello "/_app/datahub/$subjectId/graph"!</div>;
};

export const Route = createFileRoute('/_app/datahub/$subjectId/graph')({
  component: RouteComponent
});
