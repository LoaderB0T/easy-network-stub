import { RequestData } from 'easy-network-stub';
import { FakeNetworkIntercept } from './fake-network-intercept.js';
import { EventSourcePolyfill, MessageEvent } from 'event-source-polyfill';
import { parseFetch } from './parse-fetch.js';

export function listenForEvents(
  url: string,
  cb: (e: MessageEvent) => void
): Promise<EventSourcePolyfill> {
  return new Promise<EventSourcePolyfill>((resolve, reject) => {
    const source = new EventSourcePolyfill(url);
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

export const parseFetchWithEventSource = async (
  fakeNetwork: FakeNetworkIntercept,
  req: RequestData,
  cb: (e: MessageEvent) => void
) => {
  const redirectReq: RequestData = await parseFetch(fakeNetwork, req);
  if (!redirectReq.url) {
    throw new Error('No url found in response.');
  }
  if (!redirectReq.method) {
    throw new Error('No method found in response.');
  }
  return listenForEvents(redirectReq.url, cb);
};
