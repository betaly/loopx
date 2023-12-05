import {inject, Provider} from '@loopback/core';

import {LOGGER} from '../keys';
import {ILogger} from '../logger';
import {PinoConsoleLogger} from '../pino/pino-logger-console';
import {PinoLoggerOptions} from '../pino/types';

export class PinoLoggerProvider implements Provider<ILogger> {
  logger: ILogger;

  constructor(
    @inject(LOGGER.PINO_CONFIG, {optional: true})
    options: PinoLoggerOptions = {},
  ) {
    this.logger = new PinoConsoleLogger(options.namespace ?? 'main', options);
  }

  // Provider interface
  value() {
    return this.logger;
  }
}
