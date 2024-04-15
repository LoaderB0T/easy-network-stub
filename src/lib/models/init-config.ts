import { ErrorLog } from './error-log.js';
import { Interceptor } from './interceptor.js';

export type InitConfig<T> = {
  interceptor: Interceptor<T>;
  failer: (error: Error | string) => void;
  errorLogger?: (error: ErrorLog) => void;
  responseProcessor?: (response: any) => any;
};
