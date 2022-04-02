import { RequestData } from '../src/models/request';
import { FakeNetworkIntercept } from './fake-network-intercept';

export const parseFetch = async (fakeNetwork: FakeNetworkIntercept, req: RequestData) => {
  const fetchData = await fakeNetwork.fetch(req);
  return JSON.parse(fetchData.body);
};
