import { ErrorLog } from './error-log';
import { Interceptor } from './interceptor';

export type InitConfig<T> = {
  interceptor: Interceptor<T>;
  failer: (error: Error | string) => void;
  errorLogger?: (error: ErrorLog) => void;
  responseProcessor?: (response: any) => any;
};
