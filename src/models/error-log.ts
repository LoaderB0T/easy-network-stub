import { Stub } from './stub.js';

export type ErrorLog = {
  message: string;
  stack?: string;
  registeredStubs: Stub<any, any>[];
  request: any;
  url: string;
  method: string;
};
