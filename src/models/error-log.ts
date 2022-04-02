import { Stub } from './stub';

export type ErrorLog = {
  message: string;
  stack?: string;
  registeredStubs: Stub<any>[];
  request: any;
  url: string;
  method: string;
};
