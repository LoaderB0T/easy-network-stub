import { FakeNetworkIntercept } from '../fake-network-intercept';
import { afterEachLog } from '../log';
import { parseFetch } from '../parse-fetch';
import { ErrorResponse } from '../../src/models/error-response';
import { TestEasyNetworkStub } from '../test-easy-network-stub';

describe('Failed Requests', () => {
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

  test('Fail a get request', async () => {
    testEasyNetworkStub.stub('GET', 'posts/all', () => {
      return Promise.reject({
        statusCode: 400,
        content: 'Example error message',
        headers: {
          'x-error-code': '2'
        }
      } as ErrorResponse<string>);
    });
    let error: any;
    await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all' }).catch(e => {
      error = e;
    });
    expect(testEasyNetworkStub.lastError.message).toBe('');
    expect(error).toBe('"Example error message"');
  });
});
