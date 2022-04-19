import { HttpMethod } from './http-method.js';
import { Response } from './response.js';

export type RequestData = {
  url: string;
  method: HttpMethod;
  body?: any;
  headers?: { [key: string]: string | string[] };
};

export type Request = RequestData & {
  reply: (response: Response) => void;
  destroy: () => void;
};
