import { Stub } from './stub';

export type ErrorLog = {
  message: string;
  stack?: string;
  registeredStubs: Stub<any, any>[];
  request: any;
  url: string;
  method: string;
};
