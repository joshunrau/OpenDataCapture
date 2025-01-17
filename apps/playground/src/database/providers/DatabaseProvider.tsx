import { PGliteProvider } from '@electric-sql/pglite-react';

import { db } from '../db';

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PGliteProvider db={db}>{children}</PGliteProvider>;
};
