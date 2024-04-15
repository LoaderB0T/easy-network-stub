import { ErrorLogger } from './error-logger.js';
import { Failer } from './failer.js';
import { ParameterType } from './parameter-type.js';
import { Stub } from './stub.js';

export type Config = {
  errorLogger: ErrorLogger;
  failer: Failer;
  parameterTypes: ParameterType[];
  stubs: Stub<any, any>[];
};
