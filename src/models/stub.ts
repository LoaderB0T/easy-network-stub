import { HttpMethod } from './http-method';
import { QueryParam } from './query-param';
import { RouteParam } from './route-param';
import { RouteResponseCallback } from './route-response-callback';

export type Stub<T extends string, U> = {
  regx: RegExp;
  response: RouteResponseCallback<T, U>;
  params: RouteParam[];
  queryParams: QueryParam[];
  method: HttpMethod;
  friendlyName: string;
};
