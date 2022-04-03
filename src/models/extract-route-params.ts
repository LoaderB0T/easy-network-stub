import { RouteResponseCallback } from './route-response-callback';

export type FlattenUnion<T> = {} extends T
  ? never
  : {
      [K in keyof T]: K extends keyof T ? (T[K] extends any[] ? T[K] : T[K] extends object ? FlattenUnion<T[K]> : T[K]) : T[K];
    };

export type ExtractRouteParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? FlattenUnion<GetParam<Param> & ExtractRouteParams<Rest>>
  : // ? GetParam<Param> & ExtractRouteParams<Rest>
    {};

// export type GetParam<T extends string> = T extends `${infer Param}?${string}`
//   ? T extends `${string}:${infer ParamType}`
//     ? { [K in Param]: TypeConverter<ParamType> | undefined }
//     : { [K in Param]: string | undefined }
//   : T extends `${infer Param}:${infer ParamType}`
//   ? { [K in Param]: TypeConverter<ParamType> }
//   : { [K in T]: string };
export type GetParam<T extends string> = T extends `${infer Param}:${infer ParamType}`
  ? T extends `${infer ParamWithoutQuestionmark}?:${string}`
    ? { [K in ParamWithoutQuestionmark]: TypeConverter<ParamType> | undefined }
    : { [K in Param]: TypeConverter<ParamType> }
  : T extends `${infer ParamWithoutQuestionmark}?`
  ? { [K in ParamWithoutQuestionmark]: string | undefined }
  : { [K in T]: string };

export type TypeConverter<T extends string> = T extends 'number' ? number : T extends 'boolean' ? boolean : string;
