const RUNTIME_PREFIX = '/runtime/v1/';

/**
 * Resolve a bare runtime specifier from an instrument bundle to a URL Node can import.
 *
 * A bundle imports the runtime by absolute path (`/runtime/v1/zod@3.x/v4.js`) because in the
 * browser those paths are served over HTTP. Under Node they must be resolved against the installed
 * `@opendatacapture/runtime-v1`, whose `./*` export maps straight onto `dist`.
 */
function resolveRuntimeImport(specifier: string): string {
  if (!specifier.startsWith(RUNTIME_PREFIX)) {
    throw new Error(`Unexpected non-runtime import in instrument bundle: ${specifier}`);
  }
  return import.meta.resolve(`@opendatacapture/runtime-v1/${specifier.slice(RUNTIME_PREFIX.length)}`);
}

export { resolveRuntimeImport };
