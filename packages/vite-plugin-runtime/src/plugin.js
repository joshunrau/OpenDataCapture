import * as fs from 'fs';
import * as path from 'path';

import { generateMetadata, MANIFEST_FILENAME } from '@opendatacapture/runtime-meta';

/**
 * @param {import('@opendatacapture/runtime-meta').RuntimeOptions} [options]
 * @returns {Promise<import('vite').Plugin | false>}
 */
export async function plugin(options) {
  if (options?.disabled) {
    return false;
  }
  const metadata = await generateMetadata();
  return {
    buildStart: async () => {
      for (const [version, { baseDir, manifest }] of metadata) {
        const destination = path.resolve(`dist/runtime/${version}`);
        await fs.promises.cp(baseDir, destination, { recursive: true });
        await fs.promises.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    config: () => ({
      optimizeDeps: {
        exclude: Array.from(metadata.values().flatMap((pkg) => pkg.importPaths))
      }
    }),
    configureServer: (server) => {
      server.middlewares.use('/runtime', async (req, res, next) => {
        const [version, ...paths] = req.url?.split('/').filter(Boolean) ?? [];
        const filepath = paths.join('/');
        if (!(version && filepath) || !metadata.has(version)) {
          return next();
        }

        const { baseDir, manifest } = /** @type {import('@opendatacapture/runtime-meta').RuntimeVersionMetadata} */ (
          metadata.get(version)
        );

        /** @type {{ content: string; contentType: string; }} */
        let resource;
        if (filepath === MANIFEST_FILENAME) {
          resource = {
            content: JSON.stringify(manifest),
            contentType: 'application/json'
          };
        } else if (manifest.declarations.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/plain'
          };
        } else if (manifest.html.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/html'
          };
        } else if (manifest.styles.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/css'
          };
        } else if (manifest.sources.includes(filepath)) {
          resource = {
            content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
            contentType: 'text/javascript'
          };
        } else {
          return next();
        }
        res.writeHead(200, { 'Content-Type': resource.contentType });
        res.end(resource.content);
      });
    },
    name: 'vite-plugin-runtime'
  };
}
