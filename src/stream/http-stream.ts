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
    console.log(
      `Created fake server for response on: ${this._httpServer.address()?.toString()}\n\n`
    );
  }

  private async _createServer() {
    let port = 3000;

    const server = http.createServer(async (req, res) => {
      // get URI path
      const uri = new URL('init', 'http://localhost').pathname;

      // return response
      switch (uri) {
        case '/init':
          this._sseStart(res);
          this._res = res;
          break;
      }
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
          console.log(`Listening on port: ${port}`);
          resolve();
        })
        .on('error', e => {
          console.log(`Error on port: ${port}`);
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

    const res = this._res.write(`data: ${JSON.stringify(responseFragment)}\n\n`);
    console.log(`Response sent: ${res}`);
  }

  public close() {
    this._res?.end();
    this._httpServer?.close();
  }
}
