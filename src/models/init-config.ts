import { Interceptor } from './interceptor';
import { LogLevel } from './log-level';

export type InitConfig = {
  interceptor: Interceptor;
  failer: (error: Error | string) => void;
  logLevel?: LogLevel;
};
