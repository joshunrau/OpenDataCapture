import fs from 'fs';
import path from 'path';

import { runtimeMiddleware } from './runtime-middleware.js';

/**
 * @typedef {Object} RuntimeManifest
 * @property {string[]} declarations - List of declaration file paths.
 * @property {string[]} sources - List of source file paths.
 * @property {string[]} styles - List of style file paths.
 */

/**
 * @typedef {Object} RuntimeVersionMetadata
 * @property {string} baseDir
 * @property {string[]} importPaths
 * @property {RuntimeManifest} manifest
 * @property {string} version
 */

/**
 * @typedef {Object} RuntimeOptions
 * @property {boolean} [disabled]
 */

const MANIFEST_FILENAME = 'runtime.json';

const RUNTIME_DIR = path.resolve(import.meta.dirname, '../../../runtime');

const RUNTIME_DIST_DIRNAME = 'dist';

/** @type {(path: string) => Promise<boolean>} */
const isDirectory = async (path) => fs.existsSync(path) && fs.promises.lstat(path).then((stat) => stat.isDirectory());

/**
 * Generate the `RuntimeManifest` from a given directory
 * @private
 * @param {string} baseDir
 * @returns {Promise<RuntimeManifest>}
 */
async function generateManifest(baseDir) {
  /** @type {{ declarations: string[], sources: string[], styles: string[] }} */
  const results = { declarations: [], sources: [], styles: [] };
  /** @param {string} dir */
  await (async function resolveDir(dir) {
    const files = await fs.promises.readdir(dir, 'utf-8');
    for (const file of files) {
      const abspath = path.join(dir, file);
      if (await isDirectory(abspath)) {
        await resolveDir(abspath);
      } else if (abspath.endsWith('.css')) {
        results.styles.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.js')) {
        results.sources.push(abspath.replace(`${baseDir}/`, ''));
      } else if (abspath.endsWith('.d.ts')) {
        results.declarations.push(abspath.replace(`${baseDir}/`, ''));
      }
    }
  })(baseDir);
  return results;
}

/**
 * Generate the `RuntimeVersionMetadata` for a given RuntimeVersion
 * @param {string} version
 * @returns {Promise<RuntimeVersionMetadata>}
 */
export async function generateVersionMetadata(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, RUNTIME_DIST_DIRNAME);
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, sources, styles } = await generateManifest(baseDir);
  return {
    baseDir,
    importPaths: sources.map((filename) => `/runtime/${version}/${filename}`),
    manifest: {
      declarations,
      sources,
      styles
    },
    version
  };
}

/** @returns {Promise<RuntimeVersionMetadata[]>} */
export async function generateMetadata() {
  const versions = await fs.promises
    .readdir(RUNTIME_DIR, 'utf-8')
    .then((entries) => entries.filter((entry) => entry.match(/^v\d/)));
  return await Promise.all(versions.map((version) => generateVersionMetadata(version)));
}

/**
 * @param {RuntimeOptions} [options]
 * @returns {Promise<import('vite').PluginOption>}
 */
export async function plugin(options) {
  if (options?.disabled) {
    return false;
  }
  const packages = await generateMetadata();
  return {
    async buildStart() {
      for (const { baseDir, manifest, version } of packages) {
        const destination = path.resolve(`dist/runtime/${version}`);
        await fs.promises.cp(baseDir, destination, { recursive: true });
        await fs.promises.writeFile(path.resolve(destination, MANIFEST_FILENAME), JSON.stringify(manifest), 'utf-8');
      }
    },
    async config() {
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
}
