import * as fs from 'node:fs';
import * as path from 'node:path';

import * as esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

// The workspace packages this CLI uses are internal and unpublished, so they are bundled in rather
// than declared as dependencies. `esbuild` stays external because it ships a native binary, and
// `esbuild-wasm` because `instrument-bundler` names it in a branch only a browser ever takes.
await esbuild.build({
  banner: {
    js: [
      '#!/usr/bin/env node',
      'import { createRequire as __createRequire } from "node:module";',
      'Object.defineProperties(globalThis, {',
      '  __dirname: { value: import.meta.dirname, writable: false },',
      '  __filename: { value: import.meta.filename, writable: false },',
      '  require: { value: __createRequire(import.meta.url), writable: false }',
      '});'
    ].join('\n')
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: [...Object.keys(pkg.dependencies), 'esbuild-wasm'],
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node',
  target: ['node22', 'es2022']
});
