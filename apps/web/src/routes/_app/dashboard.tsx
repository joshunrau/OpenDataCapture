import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AppSubjectName } from '@opendatacapture/schemas/core';
import { createFileRoute } from '@tanstack/react-router';

import { useAppStore } from '@/store';

const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentUser = useAppStore((store) => store.currentUser);
  const { t } = useTranslation();

  const ability = currentUser?.ability;
  const subjects: AppSubjectName[] = ['Instrument', 'InstrumentRecord', 'Subject', 'User'];
  const isAuthorized = subjects.every((subject) => ability?.can('read', subject));

  return <div></div>;
};

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent
});
