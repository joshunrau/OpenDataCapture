import { PGlite } from '@electric-sql/pglite';
import { live } from '@electric-sql/pglite/live';
import { PGliteProvider } from '@electric-sql/pglite-react';

const db = await PGlite.create({
  extensions: {
    live
  }
});

const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PGliteProvider db={db}>{children}</PGliteProvider>;
};

export default DatabaseProvider;
