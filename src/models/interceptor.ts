import { Request } from './request.js';

export type Interceptor<T> = (baseUrl: string | RegExp, handler: (req: Request) => Promise<void>) => T;
