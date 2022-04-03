import { Config } from '../../models/config';
import { Request } from '../../models/request';
import { RouteParams } from '../../models/route-params';
import { failBecauseOfNotOrWrongMockedRoute } from './fail-because-of-not-or-wrong-mocked-route';
import { logErrorAndReplyWithErrorCode } from './log-error-and-reply-with-error-code';
import { parseRequestBody } from './parse-request-body';
import { parseRequestParameters } from './parse-request-params';

export const tryGetResponseForRequest = async (req: Request, config: Config): Promise<any | void> => {
  const urlWithoutQueryParams = req.url.split('?')[0];

  const stubsWithCorrectRoute = config.stubs.filter(x => urlWithoutQueryParams.match(x.regx) && x.method === req.method);

  let additionalErrorExplanation = '';
  const stub = stubsWithCorrectRoute.find(x =>
    x.queryParams.every(queryParam => {
      if (req.url.match(queryParam.regex)) {
        return true;
      } else if (queryParam.optional) {
        if (req.url.match(queryParam.invalidRegex)) {
          additionalErrorExplanation += `The optional query parameter '${queryParam.name}' was found, but it did not match the configured type.`;
          return false;
        }
        return true;
      } else {
        additionalErrorExplanation = `The non-optional query parameter '${queryParam.name}' was not found in the url.`;
        return false;
      }
    })
  );

  if (!stub) {
    return failBecauseOfNotOrWrongMockedRoute(req, additionalErrorExplanation, config);
  }
  let paramMap: RouteParams;
  try {
    paramMap = parseRequestParameters(stub, req.url, config);
  } catch (e: unknown) {
    return failBecauseOfNotOrWrongMockedRoute(req, e instanceof Error ? e.message : (e as any), config);
  }
  const parsedBody = parseRequestBody(req);

  let response: any;
  try {
    response = await stub.response({ body: parsedBody, params: paramMap });
  } catch (e: any) {
    return logErrorAndReplyWithErrorCode(stub, req, e, config);
  }

  return response;
};
