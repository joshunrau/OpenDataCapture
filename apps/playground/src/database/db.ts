import { IdbFs, MemoryFS, PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';

import init from './sql/init.sql?raw';

const db = await PGlite.create({
  extensions: {
    live
  },
  fs: import.meta.env.DEV ? new MemoryFS() : new IdbFs('odc_playground')
});

const result = await db.exec(`
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'migrations'
  );
`);

const isInitialized = Boolean(result[0]?.rows[0]?.exists);

if (!isInitialized) {
  await db.exec(init);
}

export { db };
