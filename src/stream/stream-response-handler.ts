import { CustomResponseHandler, Request } from 'easy-network-stub';
import { HttpStreamResponse, StreamKind } from './http-stream';

export class StreamResponseHandler extends CustomResponseHandler {
  private readonly _stream: HttpStreamResponse;

  constructor(kind: StreamKind = 'eventStream') {
    super();
    this._stream = new HttpStreamResponse(kind);
  }

  public async handle(req: Request): Promise<void> {
    await this._stream.init();
    req.reply({ statusCode: 302, headers: { location: this._stream.url } });
  }

  public addResponseFragment(fragment: string): void {
    this._stream.addResponseFragment(fragment);
  }

  public close(): void {
    this._stream.close();
  }
}
