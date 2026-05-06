import { useCallback, useState } from 'react';

import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFileInstrument } from '@opendatacapture/runtime-core';
import { AlertCircleIcon, UploadIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { Promisable } from 'type-fest';

export type FileInstrumentContentProps = {
  instrument: AnyUnilingualFileInstrument;
  onFileUploadProgress?: (progress: number) => void;
  onSubmit: (data: { file: File }) => Promisable<void>;
};

export const FileInstrumentContent = ({ instrument, onSubmit }: FileInstrumentContentProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'FAILED' | 'PENDING' | 'READY'>('READY');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { t } = useTranslation();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]!);
  }, []);

  const handleSubmit = useCallback(
    async (file: File) => {
      setStatus('PENDING');
      setUploadProgress(0);
      const [result] = await Promise.allSettled([
        onSubmit({ file }),
        new Promise((resolve) => setTimeout(resolve, 300))
      ]);
      if (result.status === 'rejected') {
        console.error(result.reason);
        setStatus('FAILED');
      } else {
        setStatus('READY');
      }
      setUploadProgress(0);
    },
    [onSubmit]
  );

  const { getInputProps, getRootProps } = useDropzone({
    maxFiles: 1,
    onDrop: handleDrop
  });

  return (
    <div className="flex flex-col">
      <Heading className="mb-6" variant="h4">
        {instrument.clientDetails?.title ?? instrument.details.title}
      </Heading>
      <div
        className="flex h-60 flex-col items-center justify-center rounded-md border border-dashed border-slate-400 p-4 dark:border-slate-600"
        data-testid="dropzone"
        {...getRootProps()}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {status === 'PENDING' ? (
            <div className="flex w-full flex-col items-center gap-3">
              <svg
                className="text-muted-foreground h-8 w-8 animate-spin"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <div className="flex w-full max-w-xs flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t({ en: 'Uploading...' })}</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center">
              <UploadIcon style={{ height: 20, strokeWidth: 2, width: 20 }} />
              <h4 className="text-semi-sm font-medium tracking-tight" data-testid="dropzone-title">
                {file
                  ? file.name
                  : t({
                      en: 'Drag and Drop or Click to Upload',
                      fr: 'Glissez-déposez ou cliquez pour télécharger'
                    })}
              </h4>
            </div>
          )}
        </div>
        <input {...getInputProps()} />
      </div>
      {status === 'FAILED' && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-md border p-3">
          <AlertCircleIcon className="shrink-0" style={{ height: '18px', strokeWidth: '2px', width: '18px' }} />
          <p className="text-sm font-medium leading-none">
            {t({
              en: 'Something Went Wrong',
              fr: "Une erreur s'est produite"
            })}
          </p>
        </div>
      )}
      <Button
        className="mt-8"
        disabled={!file || status === 'PENDING'}
        type="button"
        variant="primary"
        onClick={() => void handleSubmit(file!)}
      >
        {t('libui.form.submit')}
      </Button>
    </div>
  );
};
