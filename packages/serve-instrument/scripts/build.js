import * as fs from 'fs';
import * as path from 'path';

import * as esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };

const outdir = path.resolve(import.meta.dirname, '../dist');

await fs.promises.rm(outdir, { force: true, recursive: true });

await esbuild.build({
  banner: {
    js: '#!/usr/bin/env node'
  },
  bundle: true,
  entryPoints: [path.resolve(import.meta.dirname, '../src/cli.ts')],
  external: [...Object.keys(pkg.dependencies), 'esbuild-wasm'],
  format: 'esm',
  minify: false,
  outdir,
  platform: 'node'
  // plugins: [
  //   {
  //     name: 'external',
  //     setup(build) {
  //       const dependencies = Object.keys(pkg.dependencies);
  //       build.onResolve({ filter: /.*/, namespace: 'file' }, async (args) => {
  //         const resolved = await build.resolve(args.path, {
  //           kind: args.kind,
  //           resolveDir: args.resolveDir
  //         });

  //         if (resolved.path.includes('node_modules')) {
  //           const packageName = args.path.match(/^(@[^/]+\/[^/]+|[^/]+)/)?.at(1);
  //           if (!packageName) {
  //             throw new Error(`Cannot determine package for import path: ${args.path}`);
  //           } else if (dependencies.includes(packageName)) {
  //             return { external: true, path: args.path };
  //           }

  //           console.log(packageName);

  //           return null
  //         }

  //         return null;
  //       });
  //     }
  //   }
  // ]
});

await fs.promises.cp(path.resolve(import.meta.dirname, '../src/client'), path.resolve(outdir, 'client'), {
  recursive: true
});
