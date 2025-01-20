/* eslint-disable perfectionist/sort-objects */

import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { z } from 'zod';

import { useSettings } from '@/database/hooks/useSettings';
import { useAppStore } from '@/store';

export type UserSettingsDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const UserSettingsDialog = ({ isOpen, setIsOpen }: UserSettingsDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);
  //const settings = useAppStore((store) => store.settings);
  const updateSettings = useAppStore((store) => store.updateSettings);

  const settings = useSettings();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>User Settings</Dialog.Title>
        </Dialog.Header>
        {settings && (
          <Form
            className="py-4"
            content={[
              {
                title: 'Default Instance Settings',
                fields: {
                  apiBaseUrl: {
                    description: 'The base path for your Open Data Capture REST API.',
                    kind: 'string',
                    placeholder: 'e.g., https://demo.opendatacapture.org/api',
                    label: 'API Base URL',
                    variant: 'input'
                  }
                }
              },
              {
                title: 'Editor Settings',
                fields: {
                  enableVimMode: {
                    kind: 'boolean',
                    label: 'Enable VIM Mode (Experimental)',
                    variant: 'radio'
                  },
                  refreshInterval: {
                    description: 'The interval, in milliseconds, between builds, assuming the source code has changed',
                    kind: 'number',
                    label: 'Refresh Interval',
                    variant: 'input'
                  }
                }
              }
            ]}
            initialValues={settings}
            submitBtnLabel="Save Changes"
            validationSchema={z.object({
              apiBaseUrl: z
                .string()
                .optional()
                .transform((arg) => (arg === '' ? undefined : arg))
                .pipe(z.string().url().optional()),
              enableVimMode: z.boolean().optional(),
              refreshInterval: z.number().positive().int()
            })}
            onSubmit={(updatedSettings) => {
              updateSettings(updatedSettings);
              addNotification({ type: 'success' });
              setIsOpen(false);
            }}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
