import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { UpdateGroupData } from '@opendatacapture/schemas/group';
import { $SubjectIdentificationMethod, type SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { Promisable } from 'type-fest';
import { z } from 'zod';

export type AvailableInstrumentOptions = {
  form: { [key: string]: string };
  interactive: { [key: string]: string };
  series: { [key: string]: string };
  unknown: { [key: string]: string };
};

export type ManageGroupFormProps = {
  availableInstrumentOptions: AvailableInstrumentOptions;
  initialValues: {
    accessibleFormInstrumentIds: Set<string>;
    accessibleInteractiveInstrumentIds: Set<string>;
    defaultIdentificationMethod?: SubjectIdentificationMethod;
  };
  onSubmit: (data: Partial<UpdateGroupData>) => Promisable<any>;
  readOnly: boolean;
};

export const ManageGroupForm = ({
  availableInstrumentOptions,
  initialValues,
  onSubmit,
  readOnly
}: ManageGroupFormProps) => {
  const { t } = useTranslation();

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
              options: availableInstrumentOptions.form,
              variant: 'listbox'
            },
            accessibleInteractiveInstrumentIds: {
              kind: 'set',
              label: t('group.manage.interactive'),
              options: availableInstrumentOptions.interactive,
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
