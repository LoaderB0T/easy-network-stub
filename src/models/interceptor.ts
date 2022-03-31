import { Request } from './request';

export type Interceptor<T> = (baseUrl: string | RegExp, handler: (req: Request) => Promise<void>) => T;
