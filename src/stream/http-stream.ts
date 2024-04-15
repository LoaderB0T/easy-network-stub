import http from 'node:http';

type Res = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
};

export type StreamKind = 'eventStream' | 'ndjson';

export class HttpStreamResponse {
  private _httpServer?: http.Server;
  private _port?: number;
  private _res?: Res;
  private readonly _kind: StreamKind;

  constructor(kind: StreamKind = 'eventStream') {
    this._kind = kind;
  }

  public async init() {
    const { server, port } = await this._createServer();
    this._httpServer = server;
    this._port = port;
  }

  private async _createServer() {
    let port = 3000;

    const server = http.createServer(async (req, res) => {
      this._sseStart(res);
      this._res = res;
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
      'Content-Type': this._kind === 'eventStream' ? 'text/event-stream' : 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'access-control-allow-methods': '*',
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
