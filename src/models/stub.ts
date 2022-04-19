import { HttpMethod } from './http-method.js';
import { QueryParam } from './query-param.js';
import { RouteParam } from './route-param.js';
import { RouteResponseCallback } from './route-response-callback.js';

export type Stub<T extends string, U> = {
  regx: RegExp;
  response: RouteResponseCallback<T, U>;
  params: RouteParam[];
  queryParams: QueryParam[];
  method: HttpMethod;
  friendlyName: string;
};
