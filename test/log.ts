import chalk from 'chalk';
import { normalConsole } from './normal-console';
import { TestEasyNetworkStub } from './test-easy-network-stub';

export const afterEachLog = (testEasyNetworkStub: TestEasyNetworkStub) => {
  // TODO whenever possible: Add check if test is failed and only then log
  if (testEasyNetworkStub.lastError.message) {
    normalConsole(() => {
      console.error(chalk.red(chalk.bold('This is the last error that occurred:')));
      console.error(testEasyNetworkStub.lastError.message);
      console.error(testEasyNetworkStub.lastError.stack);
    });
  }
};
