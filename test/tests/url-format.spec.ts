import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';

describe('Url Format', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let testEasyNetworkStub: TestEasyNetworkStub;
  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
  });
  afterEach(async () => {
    await afterEachLog(testEasyNetworkStub);
  });

  const testWrap = async (base: string | RegExp, stub: string, url: string) => {
    testEasyNetworkStub = new TestEasyNetworkStub(base);
    await testEasyNetworkStub.init(fakeNetwork);
    testEasyNetworkStub.stub('GET', stub, () => {
      return 42;
    });
    const response = await parseFetch(fakeNetwork, { method: 'GET', url: url });
    expect(response).toBe(42);
  };

  test('Regex: no slash', async () => {
    await testWrap(/MyServer\/api\/Blog/, 'posts/all', 'MyServer/api/Blog/posts/all');
  });
  test('Regex: stub slash beginning', async () => {
    await testWrap(/MyServer\/api\/Blog/, '/posts/all', 'MyServer/api/Blog/posts/all');
  });

  test('Regex: stub slash end', async () => {
    await testWrap(/MyServer\/api\/Blog/, 'posts/all/', 'MyServer/api/Blog/posts/all');
  });

  test('Regex: stub slash both', async () => {
    await testWrap(/MyServer\/api\/Blog/, '/posts/all/', 'MyServer/api/Blog/posts/all');
  });

  test('Regex: base slash beginning', async () => {
    // Slash at beginning in regex not possible when call (url) does not have the slash!
    await testWrap(/\/MyServer\/api\/Blog/, 'posts/all', 'MyServer/api/Blog/posts/all').catch(e => {
      expect(e.message).toBe('This fake network interceptor does not handle real network calls.');
    });
  });

  test('Regex: base slash end', async () => {
    await testWrap(/MyServer\/api\/Blog\//, 'posts/all', 'MyServer/api/Blog/posts/all');
  });

  test('Regex: base slash both', async () => {
    // Slash at beginning in regex not possible when call (url) does not have the slash!
    await testWrap(/\/MyServer\/api\/Blog\//, 'posts/all', 'MyServer/api/Blog/posts/all').catch(
      e => {
        expect(e.message).toBe('This fake network interceptor does not handle real network calls.');
      }
    );
  });

  test('Regex: url slash beginning', async () => {
    await testWrap(/MyServer\/api\/Blog/, 'posts/all', '/MyServer/api/Blog/posts/all');
  });

  test('Regex: url slash end', async () => {
    await testWrap(/MyServer\/api\/Blog/, 'posts/all', 'MyServer/api/Blog/posts/all/');
  });

  test('Regex: url slash both', async () => {
    await testWrap(/MyServer\/api\/Blog/, 'posts/all', '/MyServer/api/Blog/posts/all/');
  });
});
