import { useMemo } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import type { UnilingualInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

import { useAppStore } from '@/store';

export type AccessibleInstrumentOptions = {
  form: { [key: string]: string };
  interactive: { [key: string]: string };
  series: { [key: string]: string };
  unknown: { [key: string]: string };
};

export type ManageGroupFormProps = {
  availableInstruments: UnilingualInstrumentInfo[];
  onSubmit: (data: Partial<UpdateGroupData>) => Promisable<any>;
  readOnly: boolean;
};

export const ManageGroupForm = ({ availableInstruments, onSubmit, readOnly }: ManageGroupFormProps) => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const { resolvedLanguage } = useTranslation();
  const { t } = useTranslation();

  const { initialValues, options } = useMemo(() => {
    const options: AccessibleInstrumentOptions = {
      form: {},
      interactive: {},
      series: {},
      unknown: {}
    };
    const initialValues = {
      accessibleFormInstrumentIds: new Set<string>(),
      accessibleInteractiveInstrumentIds: new Set<string>(),
      defaultIdentificationMethod: currentGroup?.settings.defaultIdentificationMethod
    };
    for (const instrument of availableInstruments) {
      if (instrument.kind === 'FORM') {
        options.form[instrument.id] = instrument.details.title;
        if (currentGroup?.accessibleInstrumentIds.includes(instrument.id)) {
          initialValues.accessibleFormInstrumentIds.add(instrument.id);
        }
      } else if (instrument.kind === 'INTERACTIVE') {
        options.interactive[instrument.id] = instrument.details.title;
        if (currentGroup?.accessibleInstrumentIds.includes(instrument.id)) {
          initialValues.accessibleInteractiveInstrumentIds.add(instrument.id);
        }
      }
    }
    return { initialValues, options };
  }, [availableInstruments, currentGroup, resolvedLanguage]);

  let description = t('group.manage.accessibleInstrumentsDesc');
  if (readOnly) {
    description += ` ${t('group.manage.accessibleInstrumentDemoNote')}`;
  }

  return (
    <Form
      className="mx-auto max-w-3xl"
      content={[
        {
          description,
          fields: {
            accessibleFormInstrumentIds: {
              kind: 'set',
              label: t('group.manage.forms'),
              options: options.form,
              variant: 'listbox'
            },
            accessibleInteractiveInstrumentIds: {
              kind: 'set',
              label: t('group.manage.interactive'),
              options: options.interactive,
              variant: 'listbox'
            }
          },
          title: t('group.manage.accessibleInstruments')
        },
        {
          fields: {
            defaultIdentificationMethod: {
              kind: 'string',
              label: t('group.manage.defaultSubjectIdMethod'),
              options: {
                CUSTOM_ID: t('common.customIdentifier'),
                PERSONAL_INFO: t('common.personalInfo')
              },
              variant: 'select'
            },
            idValidationRegex: {
              kind: 'string',
              label: t({
                en: 'ID Validation Pattern',
                fr: 'TBD'
              }),
              variant: 'input'
            }
          },
          title: t('group.manage.groupSettings')
        }
      ]}
      initialValues={initialValues}
      preventResetValuesOnReset={true}
      readOnly={readOnly}
      validationSchema={z.object({
        accessibleFormInstrumentIds: z.set(z.string()),
        accessibleInteractiveInstrumentIds: z.set(z.string()),
        defaultIdentificationMethod: $SubjectIdentificationMethod.optional(),
        idValidationRegex: z.string().optional()
      })}
      onSubmit={(data) =>
        void onSubmit({
          accessibleInstrumentIds: [...data.accessibleFormInstrumentIds, ...data.accessibleInteractiveInstrumentIds],
          settings: {
            defaultIdentificationMethod: data.defaultIdentificationMethod,
            idValidationRegex: data.idValidationRegex
          }
        })
      }
    />
  );
};
