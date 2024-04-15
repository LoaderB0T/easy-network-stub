import { Config } from '../../models/config.js';
import { QueryParam } from '../../models/query-param.js';
import { RouteParam } from '../../models/route-param.js';
import { RouteParams } from '../../models/route-params.js';
import { Stub } from '../../models/stub.js';
import { parseRequestQueryParam } from './parse-request-query-params.js';

export const parseRequestParameters = (stub: Stub<any, any>, url: string, config: Config) => {
  const urlWithoutQueryParams = url.split('?')[0];
  const routeParamValues = urlWithoutQueryParams.match(stub.regx);
  if (!routeParamValues) {
    throw new Error(`Could not parse route parameters for url '${url}'`);
  }

  const paramMap: RouteParams = {};

  const parseParam = (param: RouteParam | QueryParam, val: string) => {
    const knownParameter = config.parameterTypes.find(x => x.name === param.type);
    if (knownParameter) {
      return knownParameter.parser(val);
    } else {
      return val;
    }
  };

  for (let i = 0; i < stub.params.length; i++) {
    const param = stub.params[i];
    const paramValue = parseParam(param, routeParamValues[i + 1]);
    paramMap[stub.params[i].name] = paramValue;
  }
  stub.queryParams.forEach(queryParam => {
    parseRequestQueryParam(url, queryParam, parseParam, paramMap);
  });
  return paramMap;
};
