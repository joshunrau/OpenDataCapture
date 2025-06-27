import fs from 'fs/promises';
import path from 'path';

import { MANIFEST_FILENAME, resolvePackages } from './resolve.js';
import { runtimeMiddleware } from './runtime-middleware.js';

/**
 * @typedef {Object} RuntimeManifest
 * @property {string[]} declarations - List of declaration file paths.
 * @property {string[]} sources - List of source file paths.
 * @property {string[]} styles - List of style file paths.
 */

/**
 * @typedef {Object} RuntimeVersionInfo
 * @property {string} baseDir
 * @property {string[]} importPaths
 * @property {RuntimeManifest} manifest
 * @property {string} version
 */

/**
 * @typedef {Object} RuntimeOptions
 * @property {boolean} [disabled]
 */

/**
 * @param {RuntimeOptions} [options]
 * @returns {Promise<import('vite').PluginOption>}
 */
export const plugin = async (options) => {
  if (options?.disabled) {
    return false;
  }
  return {
    async buildStart() {
      const packages = await resolvePackages();
      for (const { baseDir, manifest, version } of packages) {
        const destination = path.resolve(`dist/runtime/${version}`);
        await fs.cp(baseDir, destination, { recursive: true });
        await fs.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    async config() {
      const packages = await resolvePackages();
      return {
        optimizeDeps: {
          exclude: packages.flatMap((pkg) => pkg.importPaths)
        }
      };
    },
    configureServer(server) {
      server.middlewares.use('/runtime', runtimeMiddleware);
    },
    name: 'vite-plugin-runtime'
  };
};
