import { RouteResponseCallback } from './route-response-callback';

export type FlattenUnion<T> = {} extends T
  ? never
  : {
      [K in keyof T]: K extends keyof T ? (T[K] extends any[] ? T[K] : T[K] extends object ? FlattenUnion<T[K]> : T[K]) : T[K];
    };

export type ExtractRouteParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? FlattenUnion<GetParam<Param> & ExtractRouteParams<Rest>>
  : {};

type GetParamOptional<T extends string> = T extends `${infer Param}?:${infer ParamType}`
  ? { [K in Param]: TypeConverter<ParamType> | undefined }
  : T extends `${infer Param}?`
  ? { [K in Param]: string | undefined }
  : never;

type GetParamRequired<T extends string> = T extends `${infer Param}:${infer ParamType}`
  ? { [K in Param]: TypeConverter<ParamType> }
  : T extends `${infer Param}`
  ? { [K in Param]: string }
  : never;

export type GetParam<T extends string> = T extends `${string}?${string}` ? GetParamOptional<T> : GetParamRequired<T>;

export type TypeConverter<T extends string> = T extends 'number' ? number : T extends 'boolean' ? boolean : string;
