import * as fs from 'fs';
import * as path from 'path';

import * as esbuild from 'esbuild';

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: {
    js: '#!/usr/bin/env node'
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  format: 'esm',
  loader: {
    '.node': 'copy'
  },
  minify: false,
  outdir,
  platform: 'node',
  plugins: [
    {
      name: 'external',
      setup(build) {
        build.onResolve({ filter: /.*/, namespace: 'file' }, async (args) => {
          const resolved = await build.resolve(args.path, {
            kind: args.kind,
            resolveDir: args.resolveDir
          });
          if (resolved.path.includes('node_modules')) {
            return { external: true, path: args.path };
          }
          return null;
        });
      }
    }
  ]
});
