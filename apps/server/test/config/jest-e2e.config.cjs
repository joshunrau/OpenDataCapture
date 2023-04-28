const path = require('path');

const { pathsToModuleNameMapper } = require('ts-jest');

const { compilerOptions } = require('../../tsconfig');

/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: path.resolve(__dirname, '..', '..')
  }),
  modulePaths: [compilerOptions.baseUrl],
  rootDir: path.resolve(__dirname, '..'),
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: [path.resolve(__dirname, 'jest-e2e.setup.ts')],
  verbose: true
};