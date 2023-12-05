import {defaultsDeep} from 'lodash';
import pino from 'pino';

import {PinoLoggerBase} from './pino-logger-base';
import {PinoLoggerOptions} from './types';

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
