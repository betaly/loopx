import {TimestampModel, TimestampModelMixin} from '@bleco/ds-timestamp';
import {mixin} from '@bleco/mixin';
import {SoftDeleteEntity} from '@bleco/soft-delete';

@mixin(TimestampModelMixin)
export class BaseEntity extends SoftDeleteEntity {}

export interface BaseEntity extends TimestampModel {}
