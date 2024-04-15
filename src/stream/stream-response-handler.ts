import { CustomResponseHandler, Request } from 'easy-network-stub';
import { HttpStreamResponse } from './http-stream';

export class StreamResponseHandler extends CustomResponseHandler {
  private _stream?: HttpStreamResponse;

  public async handle(req: Request): Promise<void> {
    this._stream = new HttpStreamResponse();
    await this._stream.init();
    req.reply({ statusCode: 302, headers: { location: this._stream.url } });
  }

  public addResponseFragment(fragment: string): void {
    this._stream?.addResponseFragment(fragment);
  }

  public close(): void {
    this._stream?.close();
  }
}
