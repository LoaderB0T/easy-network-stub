import { normalConsole } from './normal-console.js';
import { TestEasyNetworkStub } from './test-easy-network-stub.js';

const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export const afterEachLog = async (testEasyNetworkStub: TestEasyNetworkStub) => {
  // TODO whenever possible: Add check if test is failed and only then log
  // https://github.com/facebook/jest/issues/5292
  if (testEasyNetworkStub.lastError.message) {
    await normalConsole(() => {
      console.error(`${RED}${BOLD}This is the last error that occurred:${RESET}`);
      console.error(testEasyNetworkStub.lastError.message);
      console.error(testEasyNetworkStub.lastError.stack);
    });
  }
};
