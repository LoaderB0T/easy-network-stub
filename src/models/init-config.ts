import { Interceptor } from './interceptor';
import { LogLevel } from './log-level';

export type InitConfig<T> = {
  interceptor: Interceptor<T>;
  failer: (error: Error | string) => void;
  logLevel?: LogLevel;
};
