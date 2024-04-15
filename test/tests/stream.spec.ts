import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import {
  listenForEvents,
  listenForNdJSON,
  parseFetchWithEventSource,
} from '../parse-fetch-stream.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';
import { HttpStreamResponse, StreamResponseHandler } from 'easy-network-stub/stream';
import { MessageEvent } from 'event-source-polyfill';

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
    const stream = new HttpStreamResponse();
    await stream.init();
    const received: any[] = [];
    const listener = await listenForEvents<string>(stream.url, e => {
      received.push(JSON.parse(e));
    });

    stream.addResponseFragment({ data: 'Hello' });

    await expectValueAsync(() => received.length, 1);
    await expectValueAsync(() => received[0], { data: 'Hello' });

    stream.addResponseFragment({ data: 'World' });

    await expectValueAsync(() => received.length, 2);
    await expectValueAsync(() => received[1], { data: 'World' });

    listener.close();
    stream.close();
  });

  test('Use stream in networkStub', async () => {
    const srh = new StreamResponseHandler();
    let id = 0;
    testEasyNetworkStub.stub('GET', 'posts/{id:number}/stream', ({ params }) => {
      id = params.id;
      return srh;
    });
    let res: any;
    const listener = await parseFetchWithEventSource<string>(
      'eventStream',
      fakeNetwork,
      {
        method: 'GET',
        url: 'MyServer/api/Blog/posts/1/stream',
      },
      e => {
        res = e;
      }
    );
    srh.addResponseFragment('Hello');
    await expectValueAsync(() => res, 'Hello');
    srh.addResponseFragment(`World${id}`);
    await expectValueAsync(() => res, `World1`);
    listener.close();
    srh.close();
  });

  test('ndjson', async () => {
    const srh = new HttpStreamResponse('ndjson');
    await srh.init();
    const received: any[] = [];
    await listenForNdJSON<string>(srh.url, e => {
      received.push(e);
    });

    srh.addResponseFragment(
      JSON.stringify({ data: 'Hello' }) + '\n' + JSON.stringify({ data: 'Hello' }) + '\n'
    );
    await expectValueAsync(() => received.length, 2);
    srh.close();
  });
});
