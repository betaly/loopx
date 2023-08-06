import {TimestampRepositoryMixin} from '@bleco/ds-timestamp';
import {UserUpdatableRepository} from '@bleco/ds-user-updatable/src/mixins/user-updatable.repository.mixin';
import {mixin} from '@bleco/mixin';
import {QueryEnhancedTransactionalSoftCrudRepository} from '@bleco/soft-delete';

import {BaseEntity} from '../models';

@mixin(TimestampRepositoryMixin)
export class BaseCrudRepository<
  T extends BaseEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedTransactionalSoftCrudRepository<T, ID, Relations> {}

export interface BaseCrudRepository<T extends BaseEntity, ID, Relations extends object = {}>
  extends UserUpdatableRepository<T, ID, Relations> {}
