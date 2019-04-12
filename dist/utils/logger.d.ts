import * as winston from 'winston';
declare const logger: winston.LoggerInstance;
export declare function profile(id: string, meta?: any, callback?: (err: Error, level: string, msg: string, meta: any) => void): winston.LoggerInstance | undefined;
export declare function logError(error: any): void;
export default logger;
