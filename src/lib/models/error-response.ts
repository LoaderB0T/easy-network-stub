export interface ErrorResponse<T> {
  statusCode: number;
  content: T;
  headers?: { [key: string]: string };
}
