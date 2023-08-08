import {MyMultiTenancyMiddlewareSequence} from './multi-tenancy-middleware.sequence';
import {MyMultiTenancySequence} from './multi-tenancy.sequence';

export const SEQUENCES = [MyMultiTenancySequence, MyMultiTenancyMiddlewareSequence];
