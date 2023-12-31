import {UserUpdatableRepositoryMixin} from '@bleco/ds-user-updatable';
import {UserUpdatableRepository} from '@bleco/ds-user-updatable/src/mixins/user-updatable.repository.mixin';
import {mixin} from '@bleco/mixin';

import {UserUpdatableEntity} from '../models';
import {BaseCrudRepository} from './base-crud.repository';

@mixin(UserUpdatableRepositoryMixin({throwIfNoUser: false, userIdKey: ['userTenantId', 'id']}))
export class DefaultUserUpdatableCrudRepository<
  T extends UserUpdatableEntity,
  ID,
  Relations extends object = {},
> extends BaseCrudRepository<T, ID, Relations> {}

export interface DefaultUserUpdatableCrudRepository<T extends UserUpdatableEntity, ID, Relations extends object = {}>
  extends UserUpdatableRepository<T, ID, Relations> {}
