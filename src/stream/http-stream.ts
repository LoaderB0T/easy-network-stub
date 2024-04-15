import http from 'node:http';

type Res = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
};

export class HttpStreamResponse {
  private _httpServer?: http.Server;
  private _port?: number;
  private _res?: Res;

  constructor() {}

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

    while (true) {
      try {
        await this._tryListenOnPort(server, port);
        return { server, port };
      } catch (e) {
        port++;
      }
    }
  }

  private _sseStart(res: Res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
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

  public addResponseFragment<T>(responseFragment: T) {
    if (!this._res) {
      throw new Error('No response available');
    }

    const res = this._res.write(
      `data: ${typeof responseFragment === 'object' ? JSON.stringify(responseFragment) : responseFragment}\n\n`
    );
  }

  public close() {
    this._res?.end();
    this._httpServer?.close();
  }
}
