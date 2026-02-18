/* eslint-disable no-console */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { bundle, BUNDLER_FILE_EXT_REGEX, inferLoader } from '@opendatacapture/instrument-bundler';
import type { BundlerInput } from '@opendatacapture/instrument-bundler';
import { encodeUnicodeToBase64 } from '@opendatacapture/runtime-internal';
import { Command, InvalidArgumentError } from 'commander';

import { name, version } from '../package.json';
import { createServer } from './server';

console.log(name, version);

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);
program.argument('<target>', 'the directory containing the instrument', (target: string) => {
  target = path.resolve(target);
  if (!fs.existsSync(target)) {
    throw new InvalidArgumentError('Directory does not exist');
  } else if (!fs.lstatSync(target).isDirectory()) {
    throw new InvalidArgumentError('Not a directory');
  }
  return target;
});

program.option('-f --force', 'force dependency reoptimization');

program.option(
  '-p --port <number>',
  'the port to run the dev server on',
  (value) => {
    const port = parseInt(value, 10);
    if (Number.isNaN(port)) {
      throw new InvalidArgumentError(`Not a number: ${value}`);
    }
    return port;
  },
  3000
);

program.action(async (target: string) => {
  const { force, port } = program.opts<{ force?: boolean; port: number }>();

  const getEncodedBundle = async () => {
    const inputs: BundlerInput[] = [];
    const filepaths = await fs.promises
      .readdir(target, 'utf-8')
      .then((filenames) => filenames.filter((filename) => BUNDLER_FILE_EXT_REGEX.test(filename)))
      .then((filenames) => filenames.map((filename) => path.resolve(target, filename)));
    for (const filepath of filepaths) {
      const loader = inferLoader(filepath);
      inputs.push({
        content: await fs.promises.readFile(filepath, loader === 'dataurl' ? null : 'utf-8'),
        name: path.basename(filepath)
      });
    }
    return encodeUnicodeToBase64(await bundle({ inputs }));
  };

  await createServer(port);
});

program.parse();
