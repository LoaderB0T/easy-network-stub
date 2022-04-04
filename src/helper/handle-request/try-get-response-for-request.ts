import { Config } from '../../models/config';
import { Request } from '../../models/request';
import { RouteParams } from '../../models/route-params';
import { failBecauseOfNotOrWrongMockedRoute } from './fail-because-of-not-or-wrong-mocked-route';
import { logErrorAndReplyWithErrorCode } from './log-error-and-reply-with-error-code';
import { parseRequestBody } from './parse-request-body';
import { parseRequestParameters } from './parse-request-params';

export const tryGetResponseForRequest = async (req: Request, config: Config): Promise<{ closed: boolean; response?: any }> => {
  const splitUrl = req.url.split('?');
  const urlWithoutQueryParams = splitUrl[0];

  let ifNoStubIsFoundThenWhy = '';

  const stub = config.stubs
    .filter(stub => stub.method === req.method)
    // We sort the stubs by the count of query params, so that the most specific stub that matches the url is used
    .sort((a, b) => b.queryParams.length - a.queryParams.length)
    .find(stub => {
      if (req.url.match(stub.regx)) {
        if (stub.queryParams.filter(x => !x.optional).length === 0) {
          return true;
        }
      }
      if (!urlWithoutQueryParams.match(stub.regx)) {
        return false;
      }
      return stub.queryParams.every(queryParam => {
        if (req.url.match(queryParam.regex)) {
          return true;
        } else if (queryParam.optional) {
          if (req.url.match(queryParam.invalidRegex)) {
            ifNoStubIsFoundThenWhy += `\nStub [${stub.friendlyName}]: Optional Query Param ${queryParam.name}' was found, but it did not match the configured type.`;
            return false;
          }
          return true;
        } else {
          ifNoStubIsFoundThenWhy = `\nStub [${stub.friendlyName}] The non-optional query parameter '${queryParam.name}' was not found in the url.`;
          return false;
        }
      });
    });

  let stack: string;
  if (!stub) {
    stack = new Error().stack!;
    failBecauseOfNotOrWrongMockedRoute(req, ifNoStubIsFoundThenWhy, config, stack);
    return { closed: true };
  }
  let paramMap: RouteParams;
  try {
    stack = new Error().stack!;
    paramMap = parseRequestParameters(stub, req.url, config);
  } catch (e: unknown) {
    failBecauseOfNotOrWrongMockedRoute(req, e instanceof Error ? e.message : (e as any), config, stack!);
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
