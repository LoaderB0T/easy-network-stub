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

  test('The more query params the better', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b}&{c}', () => {
      return 3;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}', () => {
      return 5;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b}&{c}&{d}&{e}', () => {
      return 1;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b}', () => {
      return 4;
    });
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 6;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b}&{c}&{d}', () => {
      return 2;
    });
    const response1 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response1).toBe(6);
    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a',
    });
    expect(response2).toBe(5);
    const response3 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b',
    });
    expect(response3).toBe(4);
    const response4 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c',
    });
    expect(response4).toBe(3);
    const response5 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d',
    });
    expect(response5).toBe(2);
    const response6 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d&e',
    });
    expect(response6).toBe(1);
  });

  test('The more optional query params the better', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b?}&{c?}', () => {
      return 3;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}', () => {
      return 5;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b?}&{c?}&{d?}&{e?}', () => {
      return 1;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b?}', () => {
      return 4;
    });
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 6;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b?}&{c?}&{d?}', () => {
      return 2;
    });
    const response1 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response1).toBe(6);
    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a',
    });
    expect(response2).toBe(5);
    const response3 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b',
    });
    expect(response3).toBe(4);
    const response4 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c',
    });
    expect(response4).toBe(3);
    const response5 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d',
    });
    expect(response5).toBe(2);
    const response6 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d&e',
    });
    expect(response6).toBe(1);
  });

  test('The more mixed query params the better', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b?}&{c}', () => {
      return 3;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}', () => {
      return 5;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a?}&{b}&{c?}&{d?}&{e?}', () => {
      return 1;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b?}', () => {
      return 4;
    });
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return 6;
    });
    testEasyNetworkStub.stub('GET', 'posts/all?{a}&{b?}&{c?}&{d}', () => {
      return 2;
    });
    const response1 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response1).toBe(6);
    const response2 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a',
    });
    expect(response2).toBe(5);
    const response3 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b',
    });
    expect(response3).toBe(4);
    const response4 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c',
    });
    expect(response4).toBe(3);
    const response5 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d',
    });
    expect(response5).toBe(2);
    const response6 = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all?a&b&c&d&e',
    });
    expect(response6).toBe(1);
  });

  test('Route must match fully: too long not matched', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all/something', () => {
      return true;
    });
    // one time we check the positive
    const response = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/something',
    });
    expect(response).toBe(true);

    await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all/something/else',
    }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all/something/else'
    );
  });

  test('Route must match fully: too short not matched', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all/something', () => {
      return true;
    });
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all' }).catch(
      e => e
    );
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/posts/all'
    );
  });

  // For now this is not supported
  test.skip('Route must match fully: additional stuff at beginning', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all/something', () => {
      return true;
    });
    await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/new/posts/all/something',
    }).catch(e => e);
    expect(testEasyNetworkStub.lastError.message).toBe(
      'Route not mocked: [GET] MyServer/api/Blog/new/posts/all/something'
    );
  });
});
