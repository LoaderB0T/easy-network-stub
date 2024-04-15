import { RequestData } from 'easy-network-stub';
import { FakeNetworkIntercept } from './fake-network-intercept.js';
import { EventSourcePolyfill, MessageEvent } from 'event-source-polyfill';

const debugLogging = false;

export const parseFetch = async (fakeNetwork: FakeNetworkIntercept, req: RequestData) => {
  const fetchData = await fakeNetwork.fetch(req).catch(e => {
    // For debugging purposes during tests.
    if (debugLogging) {
      console.error(fakeNetwork.testEasyNetworkStub.lastError.message);
    }
    if (e?.body) {
      throw JSON.parse(e.body);
    } else if (e) {
      throw e;
    } else {
      throw new Error();
    }
  });
  if (fetchData.statusCode >= 300 && fetchData.statusCode < 400) {
    const location = fetchData.headers?.location;
    if (!location) {
      throw new Error('No location header found in response.');
    }
    const redirectReq: RequestData = {
      url: location,
      method: req.method,
    };
    return redirectReq;
  }
  return JSON.parse(fetchData.body);
};
