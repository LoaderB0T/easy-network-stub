import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import { parseFetch } from '../parse-fetch.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';
import { HttpStreamResponse } from 'easy-network-stub/stream';
import { EventSourcePolyfill, MessageEvent } from 'event-source-polyfill';

function listenForEvents(
  a: HttpStreamResponse,
  cb: (e: MessageEvent) => void
): Promise<EventSourcePolyfill> {
  return new Promise<EventSourcePolyfill>((resolve, reject) => {
    const source = new EventSourcePolyfill(a.url + '/init');
    source.addEventListener('open', e => {
      console.log(e);
      resolve(source);
    });
    source.addEventListener('error', e => {
      reject(e);
    });
    source.addEventListener('message', e => {
      cb(e);
    });
  });
}

function expectValueAsync(value: any | (() => any), toBeValue: any, timeOut = 1000) {
  const interval = 10;
  const totalTries = timeOut / interval;
  let currentTries = 0;

  function getValue(value: any | (() => any)) {
    const v = typeof value === 'function' ? value() : value;
    return typeof v === 'object' ? JSON.stringify(v) : v;
  }

  return new Promise<void>((resolve, reject) => {
    const check = () => {
      const vStr = getValue(value);
      const toBeStr = getValue(toBeValue);
      if (vStr === toBeStr) {
        resolve();
      } else if (currentTries >= totalTries) {
        reject(new Error(`Expected ${vStr} to be ${toBeStr}`));
      } else {
        currentTries++;
        setTimeout(check, interval);
      }
    };
    check();
  });
}

describe('Streaming', () => {
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

  test('Stream mock works', async () => {
    const a = new HttpStreamResponse();
    await a.init();
    const received: any[] = [];
    const listener = await listenForEvents(a, e => {
      received.push(JSON.parse(e.data));
    });

    a.addResponseFragment({ data: 'Hello' });

    await expectValueAsync(() => received.length, 1);
    await expectValueAsync(() => received[0], { data: 'Hello' });

    a.addResponseFragment({ data: 'World' });

    await expectValueAsync(() => received.length, 2);
    await expectValueAsync(() => received[1], { data: 'World' });

    listener.close();
    a.close();
  });
});
