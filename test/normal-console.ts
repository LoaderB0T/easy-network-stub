export const normalConsole = (cb: () => void) => {
  const jestConsole = console;
  global.console = require('console');
  cb();
  global.console = jestConsole;
};
