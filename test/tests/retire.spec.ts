import { beforeEach, describe, expect, test } from 'vitest';
import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';

describe('Retire', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let stub: TestEasyNetworkStub;

  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    stub = new TestEasyNetworkStub(/MyServer\/api\/Blog/);
    await stub.init(fakeNetwork);
  });

  test('retire silently drops in-flight delayed response', async () => {
    let resolveDelay!: () => void;
    const delay = new Promise<void>(r => (resolveDelay = r));

    stub.stub('GET', 'posts/all', async () => {
      await delay;
      return [1, 2, 3];
    });

    const fetchPromise = fakeNetwork.fetch({
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });

    // Retire before the delayed stub resolves
    stub.retire();
    resolveDelay();

    // Give microtasks time to settle
    await new Promise(r => setTimeout(r, 10));

    // The fetch should NOT have resolved (reply was a no-op)
    const result = await Promise.race([fetchPromise, Promise.resolve('pending')]);
    expect(result).toBe('pending');
  });

  test('retire causes early return for new requests', async () => {
    let stubCalled = false;
    stub.stub('GET', 'posts/all', () => {
      stubCalled = true;
      return [1, 2, 3];
    });

    stub.retire();

    const fetchPromise = fakeNetwork.fetch({
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });

    await new Promise(r => setTimeout(r, 10));

    // Handler returned early — stub callback never ran
    expect(stubCalled).toBe(false);

    // Fetch is still pending (no reply, no destroy)
    const result = await Promise.race([fetchPromise, Promise.resolve('pending')]);
    expect(result).toBe('pending');
  });

  test('init resets retired state', async () => {
    stub.stub('GET', 'posts/all', () => [1, 2, 3]);

    stub.retire();

    // Re-init clears retired flag
    fakeNetwork = new FakeNetworkIntercept();
    await stub.init(fakeNetwork);

    stub.stub('GET', 'posts/all', () => [4, 5, 6]);

    const response = await parseFetch(fakeNetwork, {
      method: 'GET',
      url: 'MyServer/api/Blog/posts/all',
    });
    expect(response).toEqual([4, 5, 6]);
  });

  test('retire does not suppress destroy for unretired stub', async () => {
    // No stubs registered — should call destroy (via failer)
    let gotError = false;
    stub.gotError = () => {
      gotError = true;
    };

    await fakeNetwork
      .fetch({ method: 'GET', url: 'MyServer/api/Blog/posts/unknown' })
      .catch(() => {});

    expect(gotError).toBe(true);
  });

  test('retire suppresses destroy for unmatched request', async () => {
    let gotError = false;
    stub.gotError = () => {
      gotError = true;
    };

    stub.retire();

    const fetchPromise = fakeNetwork
      .fetch({ method: 'GET', url: 'MyServer/api/Blog/posts/unknown' })
      .catch(() => 'caught');

    await new Promise(r => setTimeout(r, 10));

    // Handler returned early before it could fail/destroy
    expect(gotError).toBe(false);

    const result = await Promise.race([fetchPromise, Promise.resolve('pending')]);
    expect(result).toBe('pending');
  });
});
