import {Provider} from '@loopback/core';

import {ILogger} from '../logger.interface';
import {WinstonConsoleLogger} from '../winston/logger-console';

export class LoggerProvider implements Provider<ILogger> {
  logger: ILogger;

  constructor() {
    this.logger = new WinstonConsoleLogger();
  }

  // Provider interface
  value() {
    return this.logger;
  }
}
