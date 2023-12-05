import pino from 'pino';

import {ILogger} from '../logger';
import {LogFn, LogInfo, LogLevelWithSilent, LogLevelWithSilentOrString} from '../types';

export class PinoLoggerBase implements ILogger {
  debug: LogFn;
  error: LogFn;
  fatal: LogFn;
  info: LogFn;
  silent: LogFn;
  trace: LogFn;
  warn: LogFn;

  constructor(protected logger: pino.Logger) {
    this.debug = this.logger.debug.bind(this.logger);
    this.error = this.logger.error.bind(this.logger);
    this.fatal = this.logger.fatal.bind(this.logger);
    this.info = this.logger.info.bind(this.logger);
    this.silent = this.logger.silent.bind(this.logger);
    this.trace = this.logger.trace.bind(this.logger);
    this.warn = this.logger.warn.bind(this.logger);
  }

  get level() {
    return this.logger.level;
  }

  set level(level: LogLevelWithSilentOrString) {
    this.logger.level = level;
  }

  extend(namespace: string): ILogger {
    return new (this.constructor as typeof PinoLoggerBase)(this.logger.child({}, {msgPrefix: `[${namespace}] `}));
  }

  isLevelEnabled(level: LogLevelWithSilentOrString): boolean {
    return this.logger.isLevelEnabled(level);
  }

  log(info: LogInfo): void {
    const level = info.level.toLowerCase() as LogLevelWithSilent;
    const logFn = (this.logger[level] as LogFn) ?? (this.logger.info as LogFn);

    const time = info.timestamp;
    const meta = time ? {...(info.meta ?? {}), time} : info.meta;

    if (meta) {
      logFn(meta, info.message, ...(info.params ?? []));
    } else if (info.message) {
      logFn(info.message, ...(info.params ?? []));
    }
  }
}
