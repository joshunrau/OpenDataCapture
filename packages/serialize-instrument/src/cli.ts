import * as fs from 'node:fs';
import * as path from 'node:path';

import { bundle, inferLoader } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { InstrumentInterpreter } from '@opendatacapture/instrument-interpreter';
import type { Language } from '@opendatacapture/runtime-core';
import { Command, InvalidArgumentError } from 'commander';

import { name, version } from '../package.json';
import { InstrumentSerializationError } from './errors.js';
import { resolveRuntimeImport } from './runtime.js';
import { serializeInstrument } from './serialize.js';

const LANGUAGES = ['en', 'fr'] as const satisfies Language[];

function parseTarget(target: string) {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    throw new InvalidArgumentError('Directory does not exist');
  }
  if (!fs.lstatSync(resolved).isDirectory()) {
    throw new InvalidArgumentError('Not a directory');
  }
  return resolved;
}

function parseLanguage(value: string) {
  if (!(LANGUAGES as readonly string[]).includes(value)) {
    throw new InvalidArgumentError(`Must be one of: ${LANGUAGES.join(', ')}`);
  }
  return value as Language;
}

async function readInputs(target: string): Promise<BundlerInput[]> {
  const filenames = await fs.promises.readdir(target, { withFileTypes: true });
  const files = filenames.filter((entry) => entry.isFile());
  if (files.length === 0) {
    throw new Error(`No input files in directory: ${target}`);
  }
  return Promise.all(
    files.map(async (entry) => {
      const filepath = path.join(target, entry.name);
      const loader = inferLoader(filepath);
      return {
        content: await fs.promises.readFile(filepath, loader === 'dataurl' ? null : 'utf-8'),
        name: entry.name
      };
    })
  );
}

const program = new Command();

program
  .name(name)
  .version(version)
  .allowExcessArguments(false)
  .description('Convert a form instrument to plain JSON for use outside Open Data Capture')
  .argument('<target>', 'the directory containing the instrument source', parseTarget)
  .option('-l, --language <language>', `the language to resolve the instrument into`, parseLanguage, 'en')
  .option('-o, --outdir <path>', 'write <name>.json here instead of to stdout')
  .action(async (target: string) => {
    const { language, outdir } = program.opts<{ language: Language; outdir?: string }>();

    Object.defineProperty(globalThis, '__resolveImport', { configurable: true, value: resolveRuntimeImport });

    const instrument = await new InstrumentInterpreter().interpret(await bundle({ inputs: await readInputs(target) }), {
      kind: 'FORM'
    });
    const serialized = serializeInstrument(instrument, { language });
    const json = `${JSON.stringify(serialized, null, 2)}\n`;

    if (!outdir) {
      process.stdout.write(json);
      return;
    }
    await fs.promises.mkdir(path.resolve(outdir), { recursive: true });
    const outfile = path.join(path.resolve(outdir), `${serialized.internal.name}.json`);
    await fs.promises.writeFile(outfile, json, 'utf-8');
    process.stderr.write(`Wrote ${outfile}\n`);
  });

try {
  await program.parseAsync();
} catch (error) {
  // The violation list is the point of the error; a stack trace above it only buries it.
  process.stderr.write(
    `${error instanceof InstrumentSerializationError ? error.message : String(error instanceof Error ? error.stack : error)}\n`
  );
  process.exitCode = 1;
}
