import { Config } from '../../models/config';
import { Request } from '../../models/request';
import { RouteParams } from '../../models/route-params';
import { failBecauseOfNotOrWrongMockedRoute } from './fail-because-of-not-or-wrong-mocked-route';
import { getAllMatchingStubsAndTheirSpecificity } from './get-all-matching-stubs-and-their-specificity';
import { logErrorAndReplyWithErrorCode } from './log-error-and-reply-with-error-code';
import { parseRequestBody } from './parse-request-body';
import { parseRequestParameters } from './parse-request-params';

export const tryGetResponseForRequest = async (req: Request, config: Config): Promise<{ closed: boolean; response?: any }> => {
  const splitUrl = req.url.split('?');
  const urlWithoutQueryParams = splitUrl[0];

  const stubsWithCorrectMethod = config.stubs.filter(stub => stub.method === req.method);
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

  const stub = stubsAndTheirSpecificity.sort((a, b) => b.specificity - a.specificity)[0].stub;

  let paramMap: RouteParams;
  try {
    stack = new Error().stack!;
    paramMap = parseRequestParameters(stub, req.url, config);
  } catch (e: unknown) {
    failBecauseOfNotOrWrongMockedRoute(req, [e instanceof Error ? e.message : (e as any)], config, stack!);
    return { closed: true };
  }
  const parsedBody = parseRequestBody(req);

  let response: any;
  try {
    response = await stub.response({ body: parsedBody, params: paramMap });
  } catch (e: any) {
    logErrorAndReplyWithErrorCode(stub, req, e, config);
    return { closed: true };
  }
  return { response, closed: false };
};
