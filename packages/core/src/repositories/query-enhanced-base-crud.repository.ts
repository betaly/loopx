import {TimestampRepositoryMixin} from '@bleco/ds-timestamp';
import {UserUpdatableRepository} from '@bleco/ds-user-updatable/src/mixins/user-updatable.repository.mixin';
import {mixin} from '@bleco/mixin';
import {QueryEnhancedSoftCrudRepository} from '@bleco/soft-delete';

import {BaseEntity} from '../models';

@mixin(TimestampRepositoryMixin)
export class QueryEnhancedBaseCrudRepository<
  T extends BaseEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedSoftCrudRepository<T, ID, Relations> {}

export interface QueryEnhancedBaseCrudRepository<T extends BaseEntity, ID, Relations extends object = {}>
  extends UserUpdatableRepository<T, ID, Relations> {}
