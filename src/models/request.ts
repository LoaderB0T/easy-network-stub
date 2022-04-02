import { HttpMethod } from './http-method';
import { Response } from './response';

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
