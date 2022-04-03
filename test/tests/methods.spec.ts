import { FakeNetworkIntercept } from '../fake-network-intercept';
import { parseFetch } from '../parse-fetch';
import { TestEasyNetworkStub } from '../test-easy-network-stub';

describe('Methods', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    testEasyNetworkStub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await testEasyNetworkStub.init(fakeNetwork);
  });

  test("GET and POST don't mix", async () => {
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return {};
    });
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(testEasyNetworkStub.lastError.message).toBe('');
    await parseFetch(fakeNetwork, { method: 'POST', url: 'MyServer/api/Blog/posts/all?limit=100' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [POST] myserver/api/blog/posts/all?limit=100');
  });
});
