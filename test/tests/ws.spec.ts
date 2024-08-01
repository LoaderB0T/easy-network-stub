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

describe('WebSockets', () => {
  let fakeNetwork: FakeNetworkIntercept;
  let wsNetworkStub: EasyWsStub;

  beforeEach(async () => {
    fakeNetwork = new FakeNetworkIntercept();
    wsNetworkStub = new EasyWsStub(1337, 'connect');
    await wsNetworkStub.init();
  });

  test('Stream mock works', async () => {
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
