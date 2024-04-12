import { WebSocket, WebSocketServer } from 'ws';

export class EasyWsStub {
  private readonly _port: number;
  private readonly _path: string;
  private _socketServer?: WebSocketServer;
  private _connection?: WebSocket;
  private _resolveOnConnection?: (socket: WebSocket) => void;
  private readonly _msgListeners: { msg: any; resolve: () => void }[] = [];

  /**
   * A class to intercept and stub all messages on a certain socket.
   * @param port The port of the socket (localhost).
   * @param path The path of the socket (localhost).
   */
  constructor(port: number, path?: string) {
    this._port = port;
    const ensureLeadingSlash = (str: string) => (str.startsWith('/') ? str : `/${str}`);
    this._path = ensureLeadingSlash(path ?? '/');
  }

  /**
   * Call this in your beforeEach hook to start using the stub.
   * @returns A promise that resolves when the stub is ready to use.
   */
  public async init() {
    this._connection = undefined;
    this._socketServer = new WebSocketServer({ port: this._port, path: this._path });
    this._socketServer.on('connection', (socket: WebSocket) => {
      this._connection = socket;
      if (this._resolveOnConnection) {
        this._resolveOnConnection(socket);
      }
      this._connection.on('message', (msg: string) => {
        const listener = this._msgListeners.find(l => (l.msg = msg));
        if (listener) {
          listener.resolve();
        } else {
          throw new Error(`Unexpected message: ${msg}`);
        }
      });
    });
  }

  public async send(data: any) {
    if (!this._connection) {
      throw new Error('No connection available');
    }
    this._connection.send(data);
  }

  public async close() {
    this._socketServer?.close();
  }

  public async waitForConnection() {
    if (this._connection) {
      return;
    }
    return new Promise<void>(resolve => {
      this._resolveOnConnection = () => resolve();
    });
  }

  public async waitForMessage(message: any) {
    return new Promise<void>(resolve => {
      this._msgListeners.push({ msg: message, resolve });
    });
  }
}
