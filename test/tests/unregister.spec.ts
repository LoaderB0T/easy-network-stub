import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';

describe('Unregister', () => {
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

  test('Handle: unregister', async () => {
    const handle1 = testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 1;
    });
    const response1 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response1).toBe(1);

    const handle2 = testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 2;
    });

    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response2).toBe(1);

    handle1.unregister();

    const response3 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response3).toBe(2);
  });

  test('Handle: unregister all', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 1;
    });
    const response1 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response1).toBe(1);

    testEasyNetworkStub.unregisterAll();

    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 2;
    });

    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response2).toBe(2);
  });
});
