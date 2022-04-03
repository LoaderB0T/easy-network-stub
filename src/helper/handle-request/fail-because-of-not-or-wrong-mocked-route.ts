import { Config } from '../../models/config';
import { Request } from '../../models/request';

export const failBecauseOfNotOrWrongMockedRoute = (
  req: Request,
  additionalErrorExplanation: string,
  config: Config,
  stack: string
) => {
  config.errorLogger({
    message: `Route not mocked: [${req.method}] ${req.url}${additionalErrorExplanation ? '\n' + additionalErrorExplanation : ''}`,
    method: req.method,
    request: req,
    registeredStubs: config.stubs,
    url: req.url,
    stack
  });
  req.destroy();
  config.failer(`Route not mocked: [${req.method}] ${req.url}`);
};
