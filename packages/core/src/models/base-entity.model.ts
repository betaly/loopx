import {DataObject, Model} from '@loopback/repository';

import {TimestampModel, TimestampModelMixin} from '@bleco/ds-timestamp';
import {mixin} from '@bleco/mixin';
import {SoftDeleteEntity} from '@bleco/soft-delete';

@mixin(TimestampModelMixin)
export class BaseEntity<T = DataObject<Model>> extends SoftDeleteEntity {
  constructor(data?: Partial<T>) {
    super(data);
  }
}

export interface BaseEntity extends TimestampModel {}
