import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';

describe('Methods', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    testEasyNetworkStub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await testEasyNetworkStub.init(fakeNetwork);
  });
  afterEach(async () => {
    await afterEachLog(testEasyNetworkStub);
  });

  test("GET and POST don't mix", async () => {
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return {};
    });
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(testEasyNetworkStub.lastError.message).toBe('');
    await parseFetch(fakeNetwork, {
      method: 'POST',
      url: 'MyServer/api/Blog/posts/all?limit=100',
    }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [POST] MyServer/api/Blog/posts/all?limit=100'
    );
  });
});
