import { EasyNetworkStub } from '../src/easy-network-stub';
import { ErrorLog } from '../src/models/error-log';
import { FakeNetworkIntercept } from './fake-network-intercept';

/**
 * This is an example implementation of a network stubbing class that uses easy-network-stub.
 * Uses the FakeNetworkIntercept class to simulate network calls.
 */
export class TestEasyNetworkStub extends EasyNetworkStub {
  public lastError: ErrorLog;

  /**
   * A class to intercept and stub all calls to a certain api path.
   * @param urlMatch The match for all request urls that should be intercepted.
   * All non-stubbed calls that match this interceptor will throw an error
   */
  constructor(urlMatch: string | RegExp) {
    super(urlMatch);
  }

  public gotError = (err: any) => {
    // noop
  };

  /**
   * Call this in your beforeEach hook to start using the stub.
   * @returns A promise that resolves when the stub is ready to use.
   */
  public async init(fakeNetwork: FakeNetworkIntercept) {
    return this.initInternal({
      failer: error => {
        this.gotError(error);
      },
      interceptor: (baseUrl, handler) => {
        return fakeNetwork.intercept(baseUrl, async route => {
          await handler({
            destroy: () => route.destroy(),
            method: route.method,
            body: route.body,
            headers: route.headers,
            url: route.url,
            reply: r => route.reply({ statusCode: r.statusCode, body: JSON.stringify(r.body), headers: r.headers })
          });
        });
      },
      errorLogger: error => (this.lastError = error)
    });
  }
}
