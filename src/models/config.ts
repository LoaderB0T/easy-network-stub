import { ErrorLogger } from './error-logger';
import { Failer } from './failer';
import { ParameterType } from './parameter-type';
import { Stub } from './stub';

export type Config = {
  errorLogger: ErrorLogger;
  failer: Failer;
  parameterTypes: ParameterType[];
  stubs: Stub<any>[];
};
