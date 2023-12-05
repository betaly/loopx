import pino from 'pino';

export type PinoLoggerOptions = pino.LoggerOptions & {namespace?: string};
