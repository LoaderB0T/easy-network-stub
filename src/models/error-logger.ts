import { ErrorLog } from './error-log.js';

export type ErrorLogger = (error: ErrorLog) => void;
