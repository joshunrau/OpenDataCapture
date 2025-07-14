import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AuthPayload, LoginCredentials } from '@opendatacapture/schemas/auth';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import axios from 'axios';

import { config } from '@/config';
import { useAppStore } from '@/store';

const loginRequest = async (
  credentials: LoginCredentials
): Promise<{ accessToken: string; success: true } | { success: false }> => {
  const response = await axios.post<AuthPayload>('/v1/auth/login', credentials, {
    validateStatus: (status) => status === 200 || status === 401
  });
  if (response.status === 401) {
    console.error(response);
    return { success: false };
  }
  return { accessToken: response.data.accessToken, success: true };
};

const RouteComponent = () => {
  const login = useAppStore((store) => store.login);
  const notifications = useNotificationsStore();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await loginRequest(credentials);
    if (!result.success) {
      notifications.addNotification({
        message: t('unauthorizedError.message'),
        title: t('unauthorizedError.title'),
        type: 'error'
      });
      return;
    }
    login(result.accessToken);
    await navigate({ to: '/dashboard' });
  };

  return <div>Login</div>;
};

export const Route = createFileRoute('/auth/login')({
  beforeLoad: async () => {
    if (import.meta.env.DEV && config.dev.isBypassAuthEnabled) {
      const { login } = useAppStore.getState();
      const response = await loginRequest({
        password: config.dev.password!,
        username: config.dev.username!
      });
      if (!response.success) {
        throw new Error('Login failed');
      }
      login(response.accessToken);
      throw redirect({
        to: '/dashboard'
      });
    }
  },
  component: RouteComponent
});
