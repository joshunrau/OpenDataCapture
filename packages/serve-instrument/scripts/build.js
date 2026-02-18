import * as fs from 'fs';
import * as path from 'path';

import * as esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: {
    js: '#!/usr/bin/env node'
  },
  // bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  minify: false,
  outdir,
  platform: 'node'
});
