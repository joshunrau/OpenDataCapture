import { PGliteProvider } from '@electric-sql/pglite-react';

import { db } from '../db';
import init from '../sql/init.sql?raw';

await db.exec(init);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PGliteProvider db={db}>{children}</PGliteProvider>;
};
