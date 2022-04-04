import { ExtractRouteParams } from './extract-route-params';

export type RouteResponseCallback<T extends string, Body> = (request: {
  body: Body;
  params: ExtractRouteParams<T>;
}) => any | Promise<any>;
