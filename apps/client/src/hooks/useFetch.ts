import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

const baseURL = import.meta.env.VITE_API_HOST;

interface GetRequestOptions {
  method: 'GET';
}

interface PostRequestOptions {
  body: unknown;
  method: 'POST';
}

type UseFetchOptions = GetRequestOptions | PostRequestOptions;

/** Common hook used throughout the application to request data from our API. The
 * base URL used for requests is set in the Vite config.
 * @example
 * useFetch('/api/get-data')
 */
export function useFetch<T = unknown>(
  resourceURL: string,
  options: UseFetchOptions = {
    method: 'GET'
  }
): {
  data: T | null;
} {
  const auth = useAuthStore();
  const notifications = useNotificationsStore();

  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    fetch(baseURL + resourceURL, {
      body: options.method === 'POST' ? JSON.stringify(options.body) : null,
      method: options.method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${auth.accessToken!}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data: T) => setData(data))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        notifications.add({
          type: 'error',
          title: 'Error',
          message
        });
      });
  }, []);

  return { data };
}