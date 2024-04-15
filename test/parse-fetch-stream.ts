import { RequestData } from 'easy-network-stub';
import { FakeNetworkIntercept } from './fake-network-intercept.js';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { parseFetch } from './parse-fetch.js';
import ndjsonStream from 'can-ndjson-stream';

export function listenForEvents<T>(url: string, cb: (e: T) => void): Promise<EventSourcePolyfill> {
  return new Promise<EventSourcePolyfill>((resolve, reject) => {
    const source = new EventSourcePolyfill(url);
    source.addEventListener('open', e => {
      resolve(source);
    });
    source.addEventListener('error', e => {
      reject(e);
    });
    source.addEventListener('message', e => {
      cb(e.data as T);
    });
  });
}

export function listenForNdJSON<T>(
  url: string,
  cb: (e: T) => void
): Promise<{ close: () => void }> {
  return new Promise<{ close: () => void }>((resolve, reject) => {
    fetch(url)
      .then(response => {
        return ndjsonStream(response.body); //ndjsonStream parses the response.body
      })
      .then(stream => {
        const reader = stream.getReader();
        let read: any;
        reader.read().then(
          (read = (result: any) => {
            if (result.done) {
              return;
            }
            cb(result.value);
            reader.read().then(read);
          })
        );
        setTimeout(() => {
          resolve({ close: () => stream.cancel() });
        }, 100);
      });
  });
}

export async function parseFetchWithEventSource<T>(
  kind: 'eventStream' | 'ndjson',
  fakeNetwork: FakeNetworkIntercept,
  req: RequestData,
  cb: (e: T) => void
): Promise<{ close: () => void }> {
  const redirectReq: RequestData = await parseFetch(fakeNetwork, req);
  if (!redirectReq.url) {
    throw new Error('No url found in response.');
  }
  if (!redirectReq.method) {
    throw new Error('No method found in response.');
  }
  if (kind === 'ndjson') {
    const res = await listenForNdJSON(redirectReq.url, cb);
    return {
      close: () => res.close(),
    };
  } else {
    const res = await listenForEvents(redirectReq.url, cb);
    return {
      close: () => {
        res.close();
      },
    };
  }
}
