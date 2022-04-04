import { Request, RequestData } from '../src/models/request';
import { Response } from '../src/models/response';
import { TestEasyNetworkStub } from './test-easy-network-stub';

type RequestHandler = (req: Request) => Promise<void>;
type RequestHandlerConfig = { matcher: RegExp; requestHandler: RequestHandler };

/**
 * A class to "intercept" fake network requests.
 * Simulates network stubbing capabilities of e2e testing frameworks like cypress or playwright.
 * Is used by the TestEasyNetworkStub class where usually the test framework's stubbing capabilities are used.
 */
export class FakeNetworkIntercept {
  private _requestHandlers: RequestHandlerConfig[] = [];
  public testEasyNetworkStub: TestEasyNetworkStub;

  public intercept(matcher: RegExp | string, requestHandler: (req: Request) => Promise<void>) {
    if (typeof matcher === 'string') {
      throw new Error('string (wildcard) matcher not yet supported by this fake class.');
    }
    this._requestHandlers.push({ matcher, requestHandler });
  }

  public fetch(req: RequestData): Promise<Response> {
    const requestHandler = this._requestHandlers.find(x => x.matcher.test(req.url));
    if (requestHandler) {
      return new Promise<any>((resolve, reject) => {
        requestHandler.requestHandler({
          ...req,
          reply: r => {
            if (!r.statusCode || r.statusCode < 200 || r.statusCode > 299) {
              reject(r);
            } else {
              resolve(r);
            }
          },
          destroy: () => reject()
        });
      });
    }
    throw new Error('This fake network interceptor does not handle real network calls.');
  }
}
