# packages/serialize-instrument

Reduces a form instrument to plain JSON for consumption outside Open Data Capture — a converter to
another schema format, an archive, a third-party tool. Published to npm as a CLI.

```sh
serialize-instrument <target> [--language en|fr] [--outdir <path>]
```

`<target>` is a directory of instrument **source**; the CLI bundles it, interprets it, resolves it
to one language, and writes JSON to stdout (or to `<outdir>/<internal.name>.json`).

Like `playground-url`, this is a hybrid: `bin` is the built `dist/cli.js`, while the `.` export
stays `src/index.ts` so the repo can call `serializeInstrument` directly without a build. The
library half takes an **interpreted** instrument — `src/serialize.ts` never touches a bundle, and
only `src/cli.ts` depends on `instrument-bundler` and `instrument-interpreter`.

Read the root `AGENTS.md` first for the rules that apply everywhere. For where this sits in the
larger flow, see `.agents/docs/architecture/instrument-pipeline.md`.

## What it refuses, and why that is the product

Most real instruments cannot be serialized, and the error is the useful output. Every violation
found in one pass is collected and thrown together as an `InstrumentSerializationError` carrying
`violations: { path, reason }[]` — never the first violation alone, because an author fixing an
instrument one run at a time is the failure mode this replaces.

| Construct                             | Why it cannot be JSON                                         |
| ------------------------------------- | ------------------------------------------------------------- |
| a `dynamic` field                     | `render` is a closure; its conditional logic is unrecoverable |
| a `dynamic` field inside a `fieldset` | same, one level down                                          |
| a `block`                             | `render` returns arbitrary JSX                                |
| a zod v3 `validationSchema`           | only the v4 API has `toJSONSchema`                            |
| `z.set()` anywhere in the schema      | zod refuses to express a `Set` as JSON Schema                 |

**Measures are dropped, not refused.** They describe how to derive a score from a completed record,
which is a concern of the runtime rather than of the questions the instrument asks. A `computed`
measure holds a function and would otherwise fail every instrument that has one.

## Traps

**`src/json.ts` is the backstop, and it is what makes this safe to extend.** The field walk in
`serialize.ts` names the constructs an author is expected to hit; `collectNonJsonValues` then walks
the finished object for anything else — a `Date` in `initialValues`, a future field kind carrying a
function. Without it those are not errors, they are silently missing keys in the output. Do not
remove it because the field walk "already covers" a case.

**Cycle detection tracks ancestors, not everything seen.** An instrument routinely shares one
`options` object across several fields (`DNP_ENHANCED_DEMOGRAPHICS_QUESTIONNAIRE` does), and a
shared object serializes fine — it is written out more than once. A `WeakSet` of everything visited
reports those as circular. `ancestors.delete(value)` on the way back up is load-bearing.

**The `match` in `serializeField` ends in `.exhaustive()`, and that is the coupling that keeps
`SerializedField` honest.** Adding a field kind to `@opendatacapture/runtime-core` fails `pnpm lint`
here until the new kind is handled. `src/types.ts` lists the serializable kinds by hand precisely
because the exhaustive match is what forces that list to be revisited — do not replace it with a
catch-all pattern.

**Every workspace dependency is a devDependency, and that is deliberate.** `instrument-bundler`,
`instrument-interpreter`, `instrument-utils` and `runtime-core` are bundled into `dist/cli.js` by
`scripts/build.js` because most of them are unpublished `0.0.0` packages that npm could never
resolve. Only `commander` and `esbuild` are real dependencies, and `esbuild` stays external because
it ships a native binary. Moving a workspace package into `dependencies` publishes a broken CLI.

**`import.meta.resolve` does not exist in vitest's module runner.** A test that imports
`src/runtime.ts` and calls through to the resolution fails with
`[module runner] "import.meta.resolve" is not supported`, which is why only the guard is covered
there. The same applies to anything that pulls in `src/cli.ts`.

**The CLI must install `__resolveImport` before interpreting.** A bundle imports the runtime by
absolute path (`/runtime/v1/zod@3.x/v4.js`) because the browser serves those over HTTP; under Node
nothing resolves them until `globalThis.__resolveImport` is set. `@opendatacapture/runtime-v1` is a
peerDependency for exactly this reason.

**`z.toJSONSchema` runs against a schema built by the instrument's own copy of zod**, resolved
through `/runtime/v1/zod@3.x/v4` rather than this package's. It works because both are zod 3.25.x
and the conversion duck-types `_zod.def`. A vendored zod major that diverges from the one here
breaks it, and the symptom is a conversion error on `validationSchema`, not a type error.

## Tests

`pnpm exec vitest --project serialize-instrument`.

`src/__tests__/serialize.test.ts` builds instrument fixtures inline rather than importing
`instrument-library`, so the suite needs no `pnpm build`. The trade-off is that nothing here
exercises a real built instrument, and — as in every other CLI package in this repo — nothing
exercises the bin. After changing the field walk or `src/cli.ts`, build and run it by hand:

```sh
pnpm --filter @opendatacapture/serialize-instrument build
node packages/serialize-instrument/dist/cli.js packages/instrument-library/src/forms/DNP_HAPPINESS_QUESTIONNAIRE
```

That instrument is expected to fail with three violations; it is the fastest check that bundling,
interpretation and runtime resolution are all still wired up.
