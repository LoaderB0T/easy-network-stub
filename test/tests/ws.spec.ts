import { WebSocket, WebSocketServer } from 'ws';
import { FakeNetworkIntercept } from '../fake-network-intercept.js';
import { afterEachLog } from '../log.js';
import {
  listenForEvents,
  listenForNdJSON,
  parseFetchWithEventSource,
} from '../parse-fetch-stream.js';
import { TestEasyNetworkStub } from '../test-easy-network-stub.js';
import { EasyWsStub } from 'easy-network-stub/ws';
import { expectValueAsync } from './expect-value-async.js';

describe('WebSockets', () => {
  let wsNetworkStub: EasyWsStub;

  beforeEach(async () => {
    wsNetworkStub = new EasyWsStub(1337, 'connect');
    await wsNetworkStub.init();
  });

  test('basic', async () => {
    const wss = new WebSocket('ws://localhost:1337/connect');

    const received: any[] = [];
    wss.on('message', msg => {
      received.push(JSON.parse(msg.toString()));
    });

    await wsNetworkStub.waitForConnection();
    wsNetworkStub.send('{"value": "test123"}');

    await expectValueAsync(() => received[0]?.value, 'test123');

    wsNetworkStub.close();
    wss.close();
  });
});
