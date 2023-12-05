import {Component, ProviderMap} from '@loopback/core';

import {LOGGER} from './keys';
import {PinoLoggerProvider} from './providers/pino-logger.provider';

export class LoggerExtensionComponent implements Component {
  providers: ProviderMap = {};
  constructor() {
    this.providers = {[LOGGER.BINDINGS.LOG_ACTION.key]: PinoLoggerProvider};
  }
}
