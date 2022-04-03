export type FlattenUnion<T> = {} extends T
  ? never
  : {
      [K in keyof T]: K extends keyof T ? (T[K] extends any[] ? T[K] : T[K] extends object ? FlattenUnion<T[K]> : T[K]) : T[K];
    };

export type ExtractRouteParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? FlattenUnion<GetParam<Param> & ExtractRouteParams<Rest>>
  : {};

type GetParamOptional<T extends string> = T extends `${infer Param}?:${infer ParamType}`
  ? { [K in Param]: MakeOptional<TypeConverter<ParamType>, true> }
  : T extends `${infer Param}?`
  ? GetParamWithoutTypeInfo<Param, true>
  : never;

type GetParamRequired<T extends string> = T extends `${infer Param}:${infer ParamType}`
  ? { [K in Param]: TypeConverter<ParamType> }
  : T extends `${infer Param}`
  ? GetParamWithoutTypeInfo<Param>
  : never;

type GetParamWithoutTypeInfo<T extends string, Optional = false> = T extends `${infer Param}[]`
  ? { [K in Param]: MakeOptional<string[], Optional> }
  : { [K in T]: MakeOptional<string, Optional> };

type MakeOptional<T, Optional> = Optional extends true ? T | undefined : T;

export type GetParam<T extends string> = T extends `${string}?${string}` ? GetParamOptional<T> : GetParamRequired<T>;

type TypeConverterElemental<T extends string> = T extends 'number' ? number : T extends 'boolean' ? boolean : string;

export type TypeConverter<T extends string> = T extends `${infer Type}[]`
  ? TypeConverterElemental<Type>[]
  : TypeConverterElemental<T>;
