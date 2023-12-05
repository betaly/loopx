import {BindingKey} from '@loopback/context';

import {BINDING_PREFIX} from '../../constants';
import {ILogger} from './logger';
import {PinoLoggerOptions} from './pino/types';

export namespace LOGGER {
  /**
   * Injection key constant
   */
  export const LOGGER_INJECT = `${BINDING_PREFIX}.log.action`;

  export const PINO_CONFIG = BindingKey.create<PinoLoggerOptions>(`${LOGGER_INJECT}.pino.config`);

  /**
   * Binding keys used by this component.
   */
  export namespace BINDINGS {
    export const LOG_ACTION = BindingKey.create<ILogger>(LOGGER_INJECT);
  }
}
