import { RequestData } from '../src/models/request.js';
import { FakeNetworkIntercept } from './fake-network-intercept.js';

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
  return JSON.parse(fetchData.body);
};
