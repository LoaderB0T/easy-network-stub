import { HttpMethod } from './http-method';

export type Request = {
  url: string;
  method: HttpMethod;
  body?: any;
  headers?: { [key: string]: string | string[] };
  reply: (reply: { statusCode: number; body?: any; headers?: any }) => void;
  destroy: () => void;
};
