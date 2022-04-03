import { ParameterType } from '../../models/parameter-type';
import { QueryParam } from '../../models/query-param';

export const buildQueryParamRegex = (
  isOptionalParameter: boolean,
  knownParameter: ParameterType | undefined,
  isArray: boolean,
  queryParams: QueryParam[],
  paramName: string,
  paramValueType: string
): string => {
  const paramValueMatcher = knownParameter ? knownParameter.matcher : '(\\w+)';
  const getQueryMatcher = (valueMatcher: string) => new RegExp(`[?&]${paramName}(?:=(?:${valueMatcher})?)?(?=$|&)`, 'gi');
  queryParams.push({
    name: paramName,
    type: paramValueType,
    optional: isOptionalParameter,
    isArray,
    regex: getQueryMatcher(paramValueMatcher),
    invalidRegex: getQueryMatcher('(\\w+)')
  });
  /**
   * Query parameter regex explanation:
   * Example: paramValueMatcher -> (true|false)
   * Example: paramName -> yes
   * yes(?:=(?:(true|false))?)?(?:$|&)
   * Matches "yes=true&" "yes=true" "yes=&" "yes=" "yes"
   *
   * (?:$|&) Makes sure the query param has either no value
   *   (end of url or beginning of next query param)
   *   or a value that matches the known parameter type
   */
  return '';
};
