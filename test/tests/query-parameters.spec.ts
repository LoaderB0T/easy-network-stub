import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';

describe('Query Parameters', () => {
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
        "Stub [posts/all?{limit:number}] The non-optional query parameter 'limit' was not found in the url."
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
        "Stub [posts/all?{refresh:boolean}] The non-optional query parameter 'refresh' was not found in the url."
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
        "Stub [posts/all?{limit:number}&{filter:string}] The non-optional query parameter 'filter' was not found in the url."
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
        "Stub [posts/all?{limit?:number}&{filter?}]: Optional Query Param limit' was found, but it did not match the configured type."
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
        "Stub [posts/some?{limit?:number}&{filter?}&{required}] The non-optional query parameter 'required' was not found in the url."
    );
  });

  test('Duplicated query params (arrays)', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number[]}', ({ params }) => {
      params.limit.push(123); // compiler check -> should be an array type
      if (!Array.isArray(params.limit)) {
        throw new Error('Should be an array');
      }
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&limit=200' });
    expect(response.limit[0]).toBe(100);
    expect(response.limit[1]).toBe(200);
    expect(response.limit[2]).toBe(123);
  });

  test('Duplicated query params (single)', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit:number[]}', ({ params }) => {
      params.limit.push(123); // compiler check -> should be an array type
      if (!Array.isArray(params.limit)) {
        throw new Error('Should be an array');
      }
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(response.limit[0]).toBe(100);
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

  test('Trailing slash is optional', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{id}', ({ params }) => ({
      val: params.id
    }));
    testEasyNetworkStub.stub('GET', 'posts/all/?{id2}', ({ params }) => ({
      val: params.id2
    }));

    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all/?id=a' });
    expect(response.val).toBe('a');
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?id=a' });
    expect(response2.val).toBe('a');

    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all/?id2=a' });
    expect(response3.val).toBe('a');
    const response4 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?id2=a' });
    expect(response4.val).toBe('a');
  });

  test('Query param match is found when same url is mocked without query params', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all', () => ({}));
    testEasyNetworkStub.stub('GET', 'posts/all?{id}', ({ params }) => ({
      val: params.id
    }));

    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all/?id=a' });
    expect(response.val).toBe('a');
  });

  test('Optional array parameter', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{limit?:number[]}', ({ params }) => {
      let a = params.limit;
      a = undefined; // Compiler check -> should be optional

      if (params.limit) {
        params.limit.push(123); // compiler check -> should be an array type
        if (!Array.isArray(params.limit)) {
          throw new Error('Should be an array');
        }
      }
      return { limit: params.limit };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100&limit=200' });
    expect(response.limit[0]).toBe(100);
    expect(response.limit[1]).toBe(200);
    expect(response.limit[2]).toBe(123);
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all' });
    expect(response2.limit).toBe(undefined);
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?limit=100' });
    expect(response3.limit[0]).toBe(100);
  });

  test('Optional array parameter without type', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{text?[]}', ({ params }) => {
      let a = params.text;
      a = undefined; // Compiler check -> should be optional

      if (params.text) {
        params.text.push('123'); // compiler check -> should be an array type
        if (!Array.isArray(params.text)) {
          throw new Error('Should be an array');
        }
      }
      return { text: params.text };
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?text=100&text=200' });
    expect(response.text[0]).toBe('100');
    expect(response.text[1]).toBe('200');
    expect(response.text[2]).toBe('123');
    const response2 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all' });
    expect(response2.text).toBe(undefined);
    const response3 = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all?text=100' });
    expect(response3.text[0]).toBe('100');
  });
});
