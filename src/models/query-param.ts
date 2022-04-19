import { RouteParam } from './route-param.js';

export type QueryParam = RouteParam & { regex: RegExp; invalidRegex: RegExp; optional: boolean; isArray: boolean };
