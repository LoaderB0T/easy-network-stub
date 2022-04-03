import { FakeNetworkIntercept } from '../fake-network-intercept';
import { parseFetch } from '../parse-fetch';
import { TestEasyNetworkStub } from '../test-easy-network-stub';

describe('Query Parameters', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    testEasyNetworkStub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await testEasyNetworkStub.init(fakeNetwork);
  });

  test('Query param string', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{filter:string}', ({ params }) => {
      return { filter: params.filter };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter=test' });
    expect(response.filter).toBe('test');
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter' });
    expect(response2.filter).toBe(undefined);
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter=' });
    expect(response3.filter).toBe(undefined);
  });

  test('Query param number', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number}', ({ params }) => {
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(response.limit).toBe(100);
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit' });
    expect(response2.limit).toBe(null); // NaN -> null during JSON serialization
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=' });
    expect(response3.limit).toBe(null); // NaN -> null during JSON serialization
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100b' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [GET] myserver/api/blog/posts/all?limit=100b'); // NaN -> null during JSON serialization
  });

  test('Query param boolean', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{refresh:boolean}', ({ params }) => {
      return { refresh: params.refresh };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?refresh=true' });
    expect(response.refresh).toBe(true);
    expect(testEasyNetworkStub.lastError.message).toBe('');
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?refresh=false' });
    expect(response2.refresh).toBe(false);
    expect(testEasyNetworkStub.lastError.message).toBe('');
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?refresh' });
    expect(response3.refresh).toBe(false); // @todo does 'true' make more sense here?
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?refresh=1' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [GET] myserver/api/blog/posts/all?refresh=1');
  });

  test('Multiple query params', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number}&{filter:string}', ({ params }) => {
      return { limit: params.limit, filter: params.filter };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&filter=test' });
    expect(response.limit).toBe(100);
    expect(response.filter).toBe('test');

    // The order of the query params is not important
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter=test&limit=100' });
    expect(response2.limit).toBe(100);
    expect(response2.filter).toBe('test');

    // All query params need to be present
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [GET] myserver/api/blog/posts/all?limit=100');
  });
});
