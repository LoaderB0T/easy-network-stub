import { Config } from '../../models/config.js';
import { QueryParam } from '../../models/query-param.js';
import { RouteParam } from '../../models/route-param.js';
import { buildStubRegexForSegment } from './build-stub-regex-for-segment.js';

export const buildStubRegex = (segments: string[], params: RouteParam[], queryParams: QueryParam[], config: Config) => {
  return `${segments
    .map(segment => {
      return buildStubRegexForSegment(segment, params, queryParams, config);
    })
    .join('')}/?$`;
};
