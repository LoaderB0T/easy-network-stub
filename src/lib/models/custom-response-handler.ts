import { Request } from './request';

export abstract class CustomResponseHandler {
  public abstract handle(req: Request): Promise<void> | void;
}
