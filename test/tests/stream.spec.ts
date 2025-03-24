import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import {
  listenForEvents,
  listenForNdJSON,
  parseFetchWithEventSource,
} from '../parse-fetch-stream.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';
import { HttpStreamResponse, StreamResponseHandler } from 'easy-network-stub/stream';
import { expectValueAsync } from './expect-value-async.js';

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
    await stream.waitForClientConnection();

    stream.send({ data: 'Hello' });

    await expectValueAsync(() => received.length, 1);
    await expectValueAsync(() => received[0], { data: 'Hello' });

    stream.send({ data: 'World' });

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
    await srh.send('Hello');
    await expectValueAsync(() => res, 'Hello');
    await srh.send(`World${id}`);
    await expectValueAsync(() => res, `World1`);
    listener.close();
    srh.close();
  });

  test('ndjson', async () => {
    const stream = new HttpStreamResponse('ndjson');
    await stream.init();
    const received: any[] = [];
    await listenForNdJSON<string>(stream.url, e => {
      received.push(e);
    });
    await stream.waitForClientConnection();
    stream.send(
      JSON.stringify({ data: 'Hello' }) + '\n' + JSON.stringify({ data: 'Hello' }) + '\n'
    );
    await expectValueAsync(() => received.length, 2);
    stream.close();
  });

  test('Reuse stream in second request', async () => {
    const stream = new HttpStreamResponse('ndjson');
    await stream.init();
    const received: any[] = [];
    await listenForNdJSON<string>(stream.url, e => {
      received.push(e);
    });
    await stream.waitForClientConnection();
    stream.send(
      JSON.stringify({ data: 'Hello' }) + '\n' + JSON.stringify({ data: 'Hello' }) + '\n'
    );
    await expectValueAsync(() => received.length, 2);
    stream.close();
    await stream.init();

    await listenForNdJSON<string>(stream.url, e => {
      received.push(e);
    });
    await stream.waitForClientConnection();
    stream.send(
      JSON.stringify({ data: 'Hello' }) + '\n' + JSON.stringify({ data: 'Hello' }) + '\n'
    );
    await expectValueAsync(() => received.length, 4);
    stream.close();
  });
});
