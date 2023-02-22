import { ExtractRouteParams } from './extract-route-params.js';

export type RouteResponseCallback<T extends string, Body> = (request: {
  body: Body;
  params: ExtractRouteParams<T>;
  headers: { [key: string]: string | string[] };
}) => any | Promise<any>;
