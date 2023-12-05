import {PinoLoggerBase} from './pino-logger-base';
import pino from 'pino';
import {PinoLoggerOptions} from './types';
import {defaultsDeep} from 'lodash';

export class PinoConsoleLogger extends PinoLoggerBase {
  constructor(loggerOrNamespace: pino.Logger | string = 'main', options?: PinoLoggerOptions) {
    super(
      typeof loggerOrNamespace === 'string'
        ? pino(
            defaultsDeep(options, {
              msgPrefix: loggerOrNamespace && `[${loggerOrNamespace}] `,
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                },
              },
              level: process.env.LOG_LEVEL ?? 'error',
            }),
          )
        : loggerOrNamespace,
    );
  }
}
