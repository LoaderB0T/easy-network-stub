import { Config } from '../../models/config.js';
import { Request } from '../../models/request.js';
import { RouteParams } from '../../models/route-params.js';
import { cloneRequestHeaders } from './clone-request-headers.js';
import { failBecauseOfNotOrWrongMockedRoute } from './fail-because-of-not-or-wrong-mocked-route.js';
import { getAllMatchingStubsAndTheirSpecificity } from './get-all-matching-stubs-and-their-specificity.js';
import { logErrorAndReplyWithErrorCode } from './log-error-and-reply-with-error-code.js';
import { parseRequestBody } from './parse-request-body.js';
import { parseRequestParameters } from './parse-request-params.js';

export const tryGetResponseForRequest = async (req: Request, config: Config): Promise<{ closed: boolean; response?: any }> => {
  const splitUrl = req.url.split('?');
  const urlWithoutQueryParams = splitUrl[0];

  const stubsWithCorrectMethod = config.stubs.filter(s => s.method === req.method);
  const ifNoStubIsFoundThenWhy: string[] = [];
  const stubsAndTheirSpecificity = getAllMatchingStubsAndTheirSpecificity(
    stubsWithCorrectMethod,
    urlWithoutQueryParams,
    req.url,
    ifNoStubIsFoundThenWhy
  );

  let stack: string;
  if (!stubsAndTheirSpecificity.length) {
    stack = new Error().stack!;
    failBecauseOfNotOrWrongMockedRoute(req, ifNoStubIsFoundThenWhy, config, stack);
    return { closed: true };
  }

  stubsAndTheirSpecificity.sort((a, b) => b.specificity - a.specificity);
  const stub = stubsAndTheirSpecificity[0].stub;

  let paramMap: RouteParams;
  try {
    stack = new Error().stack!;
    paramMap = parseRequestParameters(stub, req.url, config);
  } catch (e: unknown) {
    failBecauseOfNotOrWrongMockedRoute(req, [e instanceof Error ? e.message : (e as any)], config, stack!);
    return { closed: true };
  }
  const parsedBody = parseRequestBody(req);
  const headers = cloneRequestHeaders(req);

  let response: any;
  try {
    response = await stub.response({ body: parsedBody, params: paramMap, headers });
  } catch (e: any) {
    logErrorAndReplyWithErrorCode(stub, req, e, config);
    return { closed: true };
  }
  return { response, closed: false };
};
