export const normalConsole = async (cb: () => void) => {
  const jestConsole = console;
  global.console = await import('console');
  cb();
  global.console = jestConsole;
};
