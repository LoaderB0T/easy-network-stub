import chalk from 'chalk';
import { normalConsole } from './normal-console.js';
import { TestEasyNetworkStub } from './test-easy-network-stub.js';

export const afterEachLog = async (testEasyNetworkStub: TestEasyNetworkStub) => {
  // TODO whenever possible: Add check if test is failed and only then log
  // https://github.com/facebook/jest/issues/5292
  if (testEasyNetworkStub.lastError.message) {
    await normalConsole(() => {
      console.error(chalk.red(chalk.bold('This is the last error that occurred:')));
      console.error(testEasyNetworkStub.lastError.message);
      console.error(testEasyNetworkStub.lastError.stack);
    });
  }
};
