import { Config } from '../../models/config.js';
import { Request } from '../../models/request.js';

export const failBecauseOfNotOrWrongMockedRoute = (
  req: Request,
  additionalErrorExplanation: string[],
  config: Config,
  stack: string
) => {
  const err = new Error();
  err.name = 'NotMockedRouteError';
  err.message = `Route not mocked: [${req.method}] ${req.url}${additionalErrorExplanation.join('\n')}`;
  config.errorLogger({
    message: err.message,
    method: req.method,
    request: req,
    registeredStubs: config.stubs,
    url: req.url,
    stack,
  });
  req.destroy();
  config.failer(`Route not mocked: [${req.method}] ${req.url}`);
  return err;
};
