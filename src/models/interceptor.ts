import { Request } from './request';

export type Interceptor = (baseUrl: string | RegExp, handler: (req: Request) => Promise<void>) => void;
