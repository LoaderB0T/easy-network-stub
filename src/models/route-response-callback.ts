import { ExtractRouteParams } from './extract-route-params';

export type RouteResponseCallback<T extends string> = (request: {
  body: any;
  params: ExtractRouteParams<T>;
}) => any | Promise<any>;
