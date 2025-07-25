import { toBasicISOString, toLowerCase } from '@douglasneuroinformatics/libjs';
import { AlertDialog, LanguageToggle, ThemeToggle } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { Branding } from '@opendatacapture/react-core';
import { isSubjectWithPersonalInfo, removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { StopCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useNavItems } from '@/hooks/useNavItems';
import { useAppStore } from '@/store';

import { NavButton } from '../NavButton';
import { UserDropup } from '../UserDropup';

export const Sidebar = () => {
  const navItems = useNavItems();
  const currentSession = useAppStore((store) => store.currentSession);
  const endSession = useAppStore((store) => store.endSession);
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-[19rem] flex-col bg-slate-900 px-3 py-2 text-slate-100 shadow-lg dark:border-r dark:border-slate-700">
      <div id="sidebar-branding-container">
        <Branding className="h-12" fontSize="md" logoVariant="light" />
      </div>
      <hr className="my-2 h-[1px] border-none bg-slate-700" />
      <nav className="flex w-full flex-col divide-y divide-slate-700">
        {navItems.map((items, i) => (
          <div className="flex flex-col py-1 first:pt-0 last:pb-0" key={i}>
            {items.map(({ disabled, url, ...props }) => (
              <NavButton
                disabled={disabled && location.pathname !== url}
                isActive={location.pathname === url}
                key={url}
                url={url}
                {...props}
              />
            ))}
            {i === navItems.length - 1 && (
              <AlertDialog>
                <AlertDialog.Trigger asChild>
                  <NavButton
                    disabled={currentSession === null}
                    icon={StopCircle}
                    isActive={false}
                    label={t('layout.navLinks.endSession')}
                    url="#"
                  />
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                  <AlertDialog.Header>
                    <AlertDialog.Title>{t('layout.endSessionModal.title')}</AlertDialog.Title>
                    <AlertDialog.Description>{t('layout.endSessionModal.message')}</AlertDialog.Description>
                  </AlertDialog.Header>
                  <AlertDialog.Footer>
                    <AlertDialog.Action
                      className="min-w-24"
                      onClick={() => {
                        endSession();
                        void navigate({ to: '/session/start-session' });
                      }}
                    >
                      {t('core.yes')}
                    </AlertDialog.Action>
                    <AlertDialog.Cancel className="min-w-24">{t('core.no')}</AlertDialog.Cancel>
                  </AlertDialog.Footer>
                </AlertDialog.Content>
              </AlertDialog>
            )}
          </div>
        ))}
      </nav>
      <hr className="invisible mt-auto" />
      <AnimatePresence>
        {currentSession && (
          <motion.div
            animate={{ opacity: 1 }}
            className="my-2 rounded-md border border-slate-700 bg-slate-800 p-2 text-sm tracking-tight text-slate-300"
            exit={{ opacity: 0 }}
            id="current-session-card"
            initial={{ opacity: 0 }}
          >
            <h5 className="text-sm font-medium">{t('common.sessionInProgress')}</h5>
            <hr className="my-1.5 h-[1px] border-none bg-slate-700" />
            {isSubjectWithPersonalInfo(currentSession.subject) ? (
              <div data-cy="current-session-info">
                <p>{`${t('core.fullName')}: ${currentSession.subject.firstName} ${currentSession.subject.lastName}`}</p>
                <p>
                  {`${t('core.identificationData.dateOfBirth.label')}: ${toBasicISOString(currentSession.subject.dateOfBirth)}`}{' '}
                </p>
                <p>
                  {`${t('core.identificationData.sex.label')}: ${t(`core.identificationData.sex.${toLowerCase(currentSession.subject.sex)}`)}`}
                </p>
              </div>
            ) : (
              <div data-cy="current-session-info">
                <p>ID: {removeSubjectIdScope(currentSession.subject.id)}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <hr className="my-1 h-[1px] border-none bg-slate-700" />
      <div className="flex items-center justify-between py-2">
        <UserDropup />
        <div className="flex h-full items-center gap-2">
          <LanguageToggle
            contentClassName="bg-slate-800 border-slate-700 text-slate-300"
            itemClassName="bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-100"
            options={{
              en: 'English',
              fr: 'Français'
            }}
            triggerClassName="hover:bg-slate-800 hover:text-slate-300 focus-visible:ring-0"
            variant="ghost"
          />
          <ThemeToggle className="hover:bg-slate-800 hover:text-slate-300" variant="ghost" />
        </div>
      </div>
    </div>
  );
};
