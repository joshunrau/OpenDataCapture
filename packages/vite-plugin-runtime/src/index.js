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
 * @property {string} baseDir - Base directory of the runtime.
 * @property {string[]} importPaths - List of import paths.
 * @property {RuntimeManifest} manifest - The manifest describing declarations, sources, and styles.
 * @property {string} version - Version string of the runtime.
 */

/**
 * @typedef {Object} RuntimeOptions
 * @property {boolean} [disabled] - Whether the runtime plugin is disabled.
 * @property {string} [packageRoot] - Root directory of the package.
 */

/**
 * Create a Vite plugin for runtime support.
 *
 * @param {RuntimeOptions} [options] - Optional configuration for the runtime plugin.
 * @returns {import('vite').PluginOption} A Vite plugin.
 */
export const runtime = (options) => {
  if (options?.disabled) {
    return false;
  }
  return {
    async buildStart() {
      const packages = await resolvePackages();
      for (const { baseDir, manifest, version } of packages) {
        const destination = path.resolve(options?.packageRoot ?? '', `dist/runtime/${version}`);
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
