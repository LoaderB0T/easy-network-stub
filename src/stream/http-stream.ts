import http from 'node:http';

type Res = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
};

export type StreamKind = 'eventStream' | 'ndjson';

export class HttpStreamResponse {
  private _httpServer?: http.Server;
  private _port?: number;
  private _res?: Res;
  private _initializeState: 'none' | 'initializing' | 'initialized' = 'none';
  private _clientConnected = false;
  private readonly _initializedCallbacks: Array<() => void> = [];
  private readonly _clientConnectedCallbacks: Array<() => void> = [];
  private readonly _kind: StreamKind;

  constructor(kind: StreamKind = 'eventStream') {
    this._kind = kind;
  }

  public async waitForClientConnection() {
    if (this._clientConnected) {
      return;
    }
    await new Promise<void>(resolve => {
      this._clientConnectedCallbacks.push(resolve);
    });
  }

  public async init() {
    if (this._initializeState === 'initialized') {
      return;
    }
    if (this._initializeState === 'initializing') {
      return new Promise<void>(resolve => {
        this._initializedCallbacks.push(resolve);
      });
    }
    this._initializeState = 'initializing';
    const { server, port } = await this._createServer();
    this._httpServer = server;
    this._port = port;
    setTimeout(() => {
      this._initializeState = 'initialized';
      this._initializedCallbacks.forEach(cb => cb());
    }, 100);
  }

  private async _createServer() {
    let port = 3000;

    const server = http.createServer(async (req, res) => {
      this._sseStart(res);
      this._res = res;
      setTimeout(() => {
        this._clientConnected = true;
        this._clientConnectedCallbacks.forEach(cb => cb());
      }, 100);
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      port = this.getRandomPort();
      try {
        await this._tryListenOnPort(server, port);
        return { server, port };
      } catch (e) {
        // Do nothing
      }
    }
  }

  private getRandomPort() {
    return Math.floor(Math.random() * 15001) + 50000;
  }

  private _sseStart(res: Res) {
    res.writeHead(200, {
      'content-type': this._kind === 'eventStream' ? 'text/event-stream' : 'application/x-ndjson',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-headers': '*',
    });
    res.write('\n');
  }

  private async _tryListenOnPort(server: http.Server, port: number) {
    return new Promise<void>((resolve, reject) => {
      server
        .listen(port)
        .on('listening', () => {
          resolve();
        })
        .on('error', e => {
          reject(e);
        });
    });
  }

  public get port() {
    return this._port;
  }

  public get url() {
    return `http://localhost:${this._port}`;
  }

  public send<T>(responseFragment: T) {
    if (!this._res) {
      throw new Error('No response available. Did you forget to call/await init()?');
    }

    const prefix = this._kind === 'eventStream' ? 'data: ' : '';
    const suffix = this._kind === 'eventStream' ? '\n\n' : '\n';

    this._res.write(
      `${prefix}${typeof responseFragment === 'object' ? JSON.stringify(responseFragment) : responseFragment}${suffix}`
    );
  }

  public close() {
    this._res?.end();
    this._httpServer?.close();
  }
}
