import * as fs from 'fs';
import * as path from 'path';

/** @type {(path: string) => Promise<boolean>} */
const isDirectory = async (path) => fs.existsSync(path) && fs.lstatSync(path).isDirectory();

/** @type {import('.').MANIFEST_FILENAME} */
export const MANIFEST_FILENAME = 'runtime.json';

/** @type {import('./index').RUNTIME_DIR} */
export const RUNTIME_DIR = path.resolve(import.meta.dirname, '../../../runtime');

/** @type {import('.').RUNTIME_DIST_DIRNAME} */
export const RUNTIME_DIST_DIRNAME = 'dist';

/** @type {import('.').generateManifest} */
export async function generateManifest(baseDir) {
  /** @type {{ declarations: string[], html: string[], sources: string[], styles: string[] }} */
  const results = { declarations: [], html: [], sources: [], styles: [] };
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
      } else if (abspath.endsWith('.html')) {
        results.html.push(abspath.replace(`${baseDir}/`, ''));
      }
    }
  })(baseDir);
  return results;
}

/** @type {import('.').generateMetadataForVersion} */
export async function generateMetadataForVersion(version) {
  const baseDir = path.resolve(RUNTIME_DIR, version, RUNTIME_DIST_DIRNAME);
  if (!(await isDirectory(baseDir))) {
    throw new Error(`Not a directory: ${baseDir}`);
  }
  const { declarations, html, sources, styles } = await generateManifest(baseDir);
  return {
    baseDir,
    importPaths: sources.map((filename) => `/runtime/${version}/${filename}`),
    manifest: {
      declarations,
      html,
      sources,
      styles
    }
  };
}

/** @type {import('.').generateMetadata} */
export async function generateMetadata() {
  const metadata = new Map();
  const versions = await fs.promises.readdir(RUNTIME_DIR, 'utf-8');
  for (const version of versions) {
    if (!version.match(/^v\d+$/)) {
      continue;
    }
    metadata.set(version, await generateMetadataForVersion(version));
  }
  return metadata;
}

/** @type {import('.').resolveRuntimeAsset} */
export async function resolveRuntimeAsset(url, metadata) {
  url = url?.replace(/^\/?runtime\//, '');

  const [version, ...paths] = url?.split('/').filter(Boolean) ?? [];
  const filepath = paths.join('/');

  if (!(version && filepath) || !metadata.has(version)) {
    return null;
  }

  const { baseDir, manifest } = /** @type {import('.').RuntimeVersionMetadata} */ (metadata.get(version));

  if (filepath === MANIFEST_FILENAME) {
    return {
      content: JSON.stringify(manifest),
      contentType: 'application/json'
    };
  } else if (manifest.declarations.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/plain'
    };
  } else if (manifest.html.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/html'
    };
  } else if (manifest.styles.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/css'
    };
  } else if (manifest.sources.includes(filepath)) {
    return {
      content: await fs.promises.readFile(path.resolve(baseDir, filepath), 'utf-8'),
      contentType: 'text/javascript'
    };
  }

  return null;
}
