import { QueryParam } from '../../models/query-param';
import { RouteParam } from '../../models/route-param';
import { RouteParams } from '../../models/route-params';

export const parseRequestQueryParam = (
  url: string,
  queryParam: QueryParam,
  parseParam: (param: RouteParam | QueryParam, val: string) => any,
  paramMap: RouteParams
) => {
  const queryParamValues = url.match(queryParam.regex);
  if (!queryParamValues) {
    if (!queryParam.optional) {
      throw new Error(`Could not parse query parameter '${queryParam.name}' for url '${url}'`);
    }
  } else {
    const paramsWithValues = queryParamValues.map(value => {
      const rgx = new RegExp(`^[?&]${queryParam.name}(?:=(.*))?$`);
      const val = value.match(rgx)![1];
      return parseParam(queryParam, val ?? '');
    });

    if (queryParam.isArray) {
      paramMap[queryParam.name] ??= [];
      paramMap[queryParam.name].push(...paramsWithValues);
    } else {
      if (paramsWithValues.length > 1) {
        throw new Error(`Query parameter '${queryParam.name}' has multiple values for url '${url}' but is not marked as array`);
      }
      paramMap[queryParam.name] = paramsWithValues[0];
    }
  }
};
