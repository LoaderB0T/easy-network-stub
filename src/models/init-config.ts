import { Interceptor } from './interceptor';

export type InitConfig = {
  interceptor: Interceptor;
  failer: (error: Error | string) => void;
  logLevel?: 'error' | 'debug';
};
