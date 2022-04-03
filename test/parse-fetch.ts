import { RequestData } from '../src/models/request';
import { FakeNetworkIntercept } from './fake-network-intercept';

const debugLogging = false;

export const parseFetch = async (fakeNetwork: FakeNetworkIntercept, req: RequestData) => {
  const fetchData = await fakeNetwork.fetch(req).catch(() => {
    // For debugging purposes during tests.
    if (debugLogging) {
      console.error(fakeNetwork.testEasyNetworkStub.lastError.message);
    }
    const error = new Error(fakeNetwork.testEasyNetworkStub.lastError.message);
    error.stack = fakeNetwork.testEasyNetworkStub.lastError.stack;
    throw error;
  });
  return JSON.parse(fetchData.body);
};
