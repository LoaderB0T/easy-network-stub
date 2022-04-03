import { FakeNetworkIntercept } from '../fake-network-intercept';
import { afterEachLog } from '../log';
import { parseFetch } from '../parse-fetch';
import { TestEasyNetworkStub } from '../test-easy-network-stub';

describe('Parameters', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    testEasyNetworkStub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await testEasyNetworkStub.init(fakeNetwork);
  });
  afterEach(() => {
    afterEachLog(testEasyNetworkStub);
  });

  test('String param', async () => {
    testEasyNetworkStub.stub('GET', 'posts/{id:string}', ({ params }) => {
      return { id: params.id };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/1' });
    expect(response.id).toBe('1');
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/abc' });
    expect(response2.id).toBe('abc');
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/true' });
    expect(response3.id).toBe('true');
    const response4 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/false' });
    expect(response4.id).toBe('false');
  });

  test('Number param', async () => {
    testEasyNetworkStub.stub('GET', 'posts/{id:number}', ({ params }) => {
      return { id: params.id };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/1' });
    expect(response.id).toBe(1);
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/648354' });
    expect(response2.id).toBe(648354);
    // String in param will fail
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/12a' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [GET] MyServer/api/Blog/posts/12a');
  });

  test('Boolean param', async () => {
    testEasyNetworkStub.stub('GET', 'posts/{yes:boolean}', ({ params }) => {
      return { yes: params.yes };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/true' });
    expect(response.yes).toBe(true);
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/false' });
    expect(response2.yes).toBe(false);

    // Values other than true or false will fail
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/notBool' }).catch(() => {});
    expect(testEasyNetworkStub.lastError.message).toBe('Route not mocked: [GET] MyServer/api/Blog/posts/notBool');
    expect(testEasyNetworkStub.lastError.method).toBe('GET');
    expect(testEasyNetworkStub.lastError.registeredStubs.length).toBe(1);
    expect(testEasyNetworkStub.lastError.request.method).toBe('GET');
    expect(testEasyNetworkStub.lastError.url).toBe('MyServer/api/Blog/posts/notBool');
  });
});
