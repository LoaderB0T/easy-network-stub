import { headers } from '../../consts/headers';
import { Config } from '../../models/config';
import { ErrorResponse } from '../../models/error-response';
import { Request } from '../../models/request';
import { Stub } from '../../models/stub';

export const logErrorAndReplyWithErrorCode = (stub: Stub<any, any>, req: Request, err: any, config: Config) => {
  const error = err as ErrorResponse<any>;
  const errorContent = typeof error.content !== 'object' ? JSON.stringify(error.content) : error.content;
  let errorHeaders = { ...headers };
  if (error.headers) {
    errorHeaders = { ...errorHeaders, ...error.headers };
  }
  if (error.statusCode) {
    // If the error has a status code, we assume that the error is purposely thrown in the test code
    req.reply({ statusCode: error.statusCode, body: errorContent, headers: errorHeaders });
  } else {
    // If the error does not have a status code, we assume that the error is caused by a bug in the test code

    const newErr: Error = {
      message:
        `Error while trying to get the response from the stub: [${stub.method}] (${stub.regx.source}) for '${req.url}'\n` +
        `msg: ${err.message}\n` +
        'This is most likely a bug in your stub. (No statusCode was provided)',
      name: 'StubError',
      stack: err.stack ?? new Error().stack
    };
    console.error(err);
    config.errorLogger({
      message: newErr.message,
      method: req.method,
      request: req,
      registeredStubs: config.stubs,
      url: req.url,
      stack: newErr.stack
    });
    req.reply({ statusCode: 500, body: JSON.stringify(errorContent ?? 'unknown error in mocked response') });
    config.failer(newErr);
  }
};
