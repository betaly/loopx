import {HeaderStrategy} from './header-strategy';
import {HostStrategy} from './host-strategy';
import {JWTStrategy} from './jwt-strategy';
import {QueryStrategy} from './query-strategy';

export * from './header-strategy';
export * from './host-strategy';
export * from './jwt-strategy';
export * from './query-strategy';

export const strategies = [HeaderStrategy, QueryStrategy, JWTStrategy, HostStrategy];
