import { Config } from '../../models/config';
import { QueryParam } from '../../models/query-param';
import { RouteParam } from '../../models/route-param';
import { buildStubRegexForSegment } from './build-stub-regex-for-segment';

export const buildStubRegex = (segments: string[], params: RouteParam[], queryParams: QueryParam[], config: Config) => {
  return (
    segments
      .map(segment => {
        return buildStubRegexForSegment(segment, params, queryParams, config);
      })
      .join('') + '/?$'
  );
};
