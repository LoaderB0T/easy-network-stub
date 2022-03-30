export type ParamMatcher = `(${string})`;

export type ParamType = 'route' | 'query';

export type ParameterType = {
  name: string;
  matcher: ParamMatcher;
  parser: (v: string) => any;
  type: ParamType;
};
