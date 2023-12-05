import {ILogger} from './logger';

export class NullLogger implements ILogger {
  get level() {
    return 'silent';
  }

  set level(level: string) {}

  debug(): void {}

  error(): void {}

  fatal(): void {}

  info(): void {}

  silent(): void {}

  trace(): void {}

  warn(): void {}

  extend(): ILogger {
    return this;
  }

  isLevelEnabled(): boolean {
    return false;
  }

  log(): void {}
}
