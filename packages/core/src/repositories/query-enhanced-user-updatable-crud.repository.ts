import {UserUpdatableRepositoryMixin} from '@bleco/ds-user-updatable';
import {UserUpdatableRepository} from '@bleco/ds-user-updatable/src/mixins/user-updatable.repository.mixin';
import {mixin} from '@bleco/mixin';

import {UserUpdatableEntity} from '../models';
import {QueryEnhancedBaseCrudRepository} from './query-enhanced-base-crud.repository';

@mixin(UserUpdatableRepositoryMixin({throwIfNoUser: false, userIdKey: ['userTenantId', 'id']}))
export class QueryEnhancedUserUpdatableCrudRepository<
  T extends UserUpdatableEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedBaseCrudRepository<T, ID, Relations> {}

export interface QueryEnhancedUserUpdatableCrudRepository<
  T extends UserUpdatableEntity,
  ID,
  Relations extends object = {},
> extends UserUpdatableRepository<T, ID, Relations> {}
