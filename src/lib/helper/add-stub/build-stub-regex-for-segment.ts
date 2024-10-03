import { buildQueryParamRegex } from './build-query-param-regex.js';
import { buildRouteParamRegex } from './build-route-param-regex.js';
import { removePrefixIfExists } from './remove-prefix-if-exists.js';
import { Config } from '../../models/config.js';
import { ParamType } from '../../models/parameter-type.js';
import { QueryParam } from '../../models/query-param.js';
import { RouteParam } from '../../models/route-param.js';

export const buildStubRegexForSegment = (
  rawSegment: string,
  params: RouteParam[],
  queryParams: QueryParam[],
  config: Config
) => {
  const { prefix, segment } = removePrefixIfExists(rawSegment);
  const paramType: ParamType = prefix === '/' || prefix === '' ? 'route' : 'query';

  const paramMatch = RegExp(/{(\w+)(\??)((?::\w+)?)((?:\[\])?)}/).exec(segment);
  if (paramMatch) {
    const paramName = paramMatch[1];
    const isOptionalParameter = paramMatch[2] === '?';
    const isArray = paramMatch[4] === '[]';
    if (paramName) {
      const paramValueType = paramMatch[3]?.substring(1) ?? 'string';
      const knownParameter =
        config.parameterTypes.find(x => x.name === paramValueType && x.type === paramType) ??
        config.parameterTypes.find(x => x.name === 'string' && x.type === paramType)!;
      if (paramType === 'route') {
        return buildRouteParamRegex(
          isOptionalParameter,
          knownParameter,
          isArray,
          prefix,
          params,
          paramName,
          paramValueType
        );
      } else {
        return buildQueryParamRegex(
          isOptionalParameter,
          knownParameter,
          isArray,
          queryParams,
          paramName,
          paramValueType
        );
      }
    }
  } else {
    return prefix + segment;
  }
};
