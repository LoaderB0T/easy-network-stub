import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { defaultsESM } from 'ts-jest/presets';
import { compilerOptions } from './tsconfig.base.json';

// Changes the tsconfig used for tests to tsconfig.spec.json
const transform = defaultsESM.transform!;
Object.keys(transform).forEach(key => {
  const value = transform[key];
  if (Array.isArray(value)) {
    value[1].tsconfig = './tsconfig.spec.json';
  }
});

const config: JestConfigWithTsJest = {
  roots: ['./test'],
  testTimeout: 90000,
  transform: {
    ...transform,
  },
  extensionsToTreatAsEsm: ['.ts'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    ...pathsToModuleNameMapper(compilerOptions.paths),
  },
  reporters: ['default', ['jest-junit', { outputName: 'junit.xml' }]],
};

export default config;
