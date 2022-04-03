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
    expect(response2.filter).toBe('');
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter=' });
    expect(response3.filter).toBe('');
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
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all?limit=100b\n' +
        "The non-optional query parameter 'limit' was not found in the url."
    );
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
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all?refresh=1\n' +
        "The non-optional query parameter 'refresh' was not found in the url."
    );
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
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all?limit=100\n' +
        "The non-optional query parameter 'filter' was not found in the url."
    );
  });

  const prepareOptionaltests = () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit?:number}&{filter?}', ({ params }) => {
      let limit = params.limit;
      let filter = params.filter;

      limit = undefined; // to validate that the type is optional
      filter = undefined; // to validate that the type is optional

      return { limit: params.limit, filter: params.filter };
    });
    testEasyNetworkStub.stub('GET', 'posts/some?{limit?:number}&{filter?}&{required}', ({ params }) => {
      let limit = params.limit;
      let filter = params.filter;
      let required = params.required;

      limit = undefined; // to validate that the type is optional
      filter = undefined; // to validate that the type is optional
      // @ts-expect-error
      required = undefined; // to validate that the type is NOT optional

      return { limit: params.limit, filter: params.filter, required: params.required };
    });
  };
  test('Optional query params sunny day', async () => {
    prepareOptionaltests();

    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&filter=test' });
    expect(response.limit).toBe(100);
    expect(response.filter).toBe('test');

    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?filter=test' });
    expect(response2.limit).toBe(undefined);
    expect(response2.filter).toBe('test');

    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(response3.limit).toBe(100);
    expect(response3.filter).toBe(undefined);

    const response4 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all' });
    expect(response4.limit).toBe(undefined);
    expect(response4.filter).toBe(undefined);
  });

  test('Optional query params rainy day', async () => {
    prepareOptionaltests();

    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100b' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all?limit=100b\n' +
        "The optional query parameter 'limit' was found, but it did not match the configured type."
    );
  });

  test('Optional query params mixed', async () => {
    prepareOptionaltests();

    const response = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/some?limit=100&filter=test&required'
    });
    expect(response.limit).toBe(100);
    expect(response.filter).toBe('test');

    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/some?filter=test&required' });
    expect(response2.limit).toBe(undefined);
    expect(response2.filter).toBe('test');

    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/some?required&limit=100' });
    expect(response3.limit).toBe(100);
    expect(response3.filter).toBe(undefined);

    const response4 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/some?required' });
    expect(response4.limit).toBe(undefined);
    expect(response4.filter).toBe(undefined);

    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/some' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/some\n' +
        "The non-optional query parameter 'required' was not found in the url."
    );
  });

  test('Duplicated query params (arrays)', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number[]}', ({ params }) => {
      params.limit[0]++;
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&limit=200' });
    expect(response.limit[0]).toBe(101);
    expect(response.limit[1]).toBe(200);
  });

  test('Duplicated query params (single)', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number[]}', ({ params }) => {
      params.limit[0]++;
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(response.limit[0]).toBe(101);
  });

  test('Single query params with multiple values fails', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number}', ({ params }) => {
      return { limit: params.limit };
    });
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&limit=200' }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all?limit=100&limit=200\n' +
        "Query parameter 'limit' has multiple values for url 'MyServer/api/Blog/posts/all?limit=100&limit=200' but is not marked as array"
    );
  });
});
