import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { PageHeader } from '@/components/PageHeader';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useSetupState } from '@/hooks/useSetupState';
import { useAppStore } from '@/store';

import { ManageGroupForm } from '../components/ManageGroupForm';
import { useUpdateGroup } from '../hooks/useUpdateGroup';

export const ManageGroupPage = () => {
  const { t } = useTranslation('group');
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const updateGroupMutation = useUpdateGroup();
  const changeGroup = useAppStore((store) => store.changeGroup);
  const setupState = useSetupState();

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t('manage.pageTitle')}
        </Heading>
      </PageHeader>
      <ManageGroupForm
        availableInstruments={instrumentInfoQuery.data ?? []}
        readOnly={Boolean(setupState.data?.isDemo && import.meta.env.PROD)}
        onSubmit={async (data) => {
          const updatedGroup = await updateGroupMutation.mutateAsync(data);
          changeGroup(updatedGroup);
        }}
      />
    </React.Fragment>
  );
};
