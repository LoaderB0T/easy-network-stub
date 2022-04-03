import { RouteParam } from './route-param';

export type QueryParam = RouteParam & { regex: RegExp };
