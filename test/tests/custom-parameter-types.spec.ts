import { FakeNetworkIntercept } from '../fake-network-intercept';
import { parseFetch } from '../parse-fetch';
import { TestEasyNetworkStub } from '../test-easy-network-stub';

describe('Custom Parameter Types', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    testEasyNetworkStub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await testEasyNetworkStub.init(fakeNetwork);
  });

  test('Add custom route parameter (string) type', async () => {
    testEasyNetworkStub.addParameterType(
      'guid',
      '([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})',
      'route',
      a => `guid:${a.toLowerCase()}`
    );

    testEasyNetworkStub.addParameterType('specialId', '([a-zA-Z0-9]{3}:[a-zA-Z0-9]{3})', 'route', a => `myId:${a.toLowerCase()}`);

    testEasyNetworkStub.stub('GET', 'posts/all/{id:guid}', ({ params }) => {
      return { id: params.id };
    });
    testEasyNetworkStub.stub('GET', 'posts/all/{id:specialId}', ({ params }) => {
      return { id: params.id };
    });
    testEasyNetworkStub.stub('GET', 'posts/all/{id:string}', ({ params }) => {
      return { id: params.id };
    });

    // Matches the first parameter type
    const response = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/5460694a-8fd5-43c5-874a-0e3e70350a32'
    });
    expect(response.id).toBe('guid:5460694a-8fd5-43c5-874a-0e3e70350a32');

    // Matches the second parameter type
    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/94a:8fd'
    });
    expect(response2.id).toBe('myId:94a:8fd');

    // Matches default string type
    const response3 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/94a-8fd2'
    });
    expect(response3.id).toBe('94a-8fd2');
  });

  test('First stub is evaluated first', async () => {
    testEasyNetworkStub.addParameterType(
      'guid',
      '([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})',
      'route',
      a => `guid:${a.toLowerCase()}`
    );

    testEasyNetworkStub.addParameterType('specialId', '([a-zA-Z0-9]{3}:[a-zA-Z0-9]{3})', 'route', a => `myId:${a.toLowerCase()}`);

    testEasyNetworkStub.stub('GET', 'posts/all/{id:string}', ({ params }) => {
      return { id: params.id };
    });
    testEasyNetworkStub.stub('GET', 'posts/all/{id:guid}', ({ params }) => {
      return { id: params.id };
    });
    testEasyNetworkStub.stub('GET', 'posts/all/{id:specialId}', ({ params }) => {
      return { id: params.id };
    });

    // Matches the string stub, because it is configured before the other stubs
    const response = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/5460694a-8fd5-43c5-874a-0e3e70350a32'
    });
    expect(response.id).toBe('5460694a-8fd5-43c5-874a-0e3e70350a32');

    // Matches the specialId stub, because ':' is not matched by the string stub
    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/123:123'
    });
    expect(response2.id).toBe('myId:123:123');
  });
});
