import { Request } from '../../models/request.js';

export const cloneRequestHeaders = (req: Request) => {
  const headers: { [key: string]: string | string[] } = {};

  for (const key in req.headers) {
    const value = req.headers[key];
    if (value instanceof Array) {
      headers[key] = [...value];
    } else {
      headers[key] = value;
    }
  }

  return headers;
};
