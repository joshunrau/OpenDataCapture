import * as fs from 'fs';
import * as path from 'path';

import * as esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');

import pkg from '../package.json' with { type: 'json' };

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: {
    js: '#!/usr/bin/env node'
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: Object.keys(pkg.dependencies),
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node'
});
