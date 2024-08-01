export function expectValueAsync(value: any | (() => any), toBeValue: any, timeOut = 1000) {
  const interval = 10;
  const totalTries = timeOut / interval;
  let currentTries = 0;

  function getValue(value: any | (() => any)) {
    const v = typeof value === 'function' ? value() : value;
    return typeof v === 'object' ? JSON.stringify(v) : v;
  }

  return new Promise<void>((resolve, reject) => {
    const check = () => {
      const vStr = getValue(value);
      const toBeStr = getValue(toBeValue);
      if (vStr === toBeStr) {
        resolve();
      } else if (currentTries >= totalTries) {
        reject(new Error(`Expected ${vStr} to be ${toBeStr}`));
      } else {
        currentTries++;
        setTimeout(check, interval);
      }
    };
    check();
  });
}
