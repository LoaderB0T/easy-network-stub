import { HttpMethod } from './http-method';
import { RouteParam } from './route-param';
import { RouteResponseCallback } from './route-response-callback';

export type Stub<T extends string> = {
  regx: RegExp;
  response: RouteResponseCallback<T>;
  params: RouteParam[];
  method: HttpMethod;
};
