import { useCallback, useEffect, useState } from 'react';

import { usePGlite } from '@electric-sql/pglite-react';

import type { Settings } from '@/models/settings.model';
import { mapKeysToCamelCase } from '@/utils/format';

export function useSettings() {
  const db = usePGlite();
  const [settings, setSettings] = useState<null | Settings>(null);

  const query = useCallback(async () => {
    const results = await db.query<{
      api_base_url: null | string;
      enable_vim_mode: boolean | null;
      refresh_interval: number;
    }>('SELECT * FROM settings LIMIT 1;', []);
    setSettings(mapKeysToCamelCase(results.rows[0]!));
  }, []);

  useEffect(() => {
    void query();
  }, []);

  return settings;
}
