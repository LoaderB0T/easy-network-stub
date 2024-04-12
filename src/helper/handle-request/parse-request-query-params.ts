import { QueryParam } from '../../models/query-param.js';
import { RouteParam } from '../../models/route-param.js';
import { RouteParams } from '../../models/route-params.js';

export const parseRequestQueryParam = (
  url: string,
  queryParam: QueryParam,
  parseParam: (param: RouteParam | QueryParam, val: string) => any,
  paramMap: RouteParams
) => {
  const queryParamValues = url.match(queryParam.regex);
  if (!queryParamValues) {
    if (!queryParam.optional) {
      throw new Error(`\nCould not parse query parameter '${queryParam.name}' for url '${url}'`);
    }
  } else {
    const paramsWithValues = queryParamValues.map(value => {
      const rgx = new RegExp(`^[?&]${queryParam.name}(?:=(.*))?$`, 'i');
      const val = value.match(rgx)![1];
      return parseParam(queryParam, val ?? '');
    });

    if (queryParam.isArray) {
      paramMap[queryParam.name] ??= [];
      paramMap[queryParam.name].push(...paramsWithValues);
    } else {
      if (paramsWithValues.length > 1) {
        throw new Error(
          `\nQuery parameter '${queryParam.name}' has multiple values for url '${url}' but is not marked as array`
        );
      }
      paramMap[queryParam.name] = paramsWithValues[0];
    }
  }
};
