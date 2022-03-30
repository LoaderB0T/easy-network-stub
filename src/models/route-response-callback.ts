import { ExtractRouteParams } from './extract-route-params';

export type RouteResponseCallback<T extends string> = (body: any, routeParams: ExtractRouteParams<T>) => any | Promise<any>;
