import { FakeNetworkIntercept } from "../fake-network-intercept.js";
import { afterEachLog } from "../log.js";
import { parseFetch } from "../parse-fetch.js";
import { TestEasyNetworkStub } from "../test-easy-network-stub.js";

describe('Headers', () => {
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

    test("All Headers are copied to the RouteResponseCallback", async () => {
        testEasyNetworkStub.stub('GET', 'posts/all', ({ headers }) => {
            return headers;
        });
        const headers = { "content-type": "application/json", "X-Custom-Header": [ "Entry1", "Entry2", "Entry3" ] };
        const response = await parseFetch(fakeNetwork, { method: 'GET', url: 'MyServer/api/Blog/posts/all', headers });
        expect(response).toEqual(headers);
    });
});