import {TimestampRepositoryMixin} from '@bleco/ds-timestamp';
import {UserUpdatableRepositoryMixin} from '@bleco/ds-user-updatable';
import {UserUpdatableRepository} from '@bleco/ds-user-updatable/src/mixins/user-updatable.repository.mixin';
import {mixin} from '@bleco/mixin';
import {DefaultTransactionalSoftCrudRepository} from '@bleco/soft-delete';

import {UserUpdatableEntity} from '../models';

@mixin(TimestampRepositoryMixin)
@mixin(UserUpdatableRepositoryMixin({throwIfNoUser: false, userIdKey: ['userTenantId', 'id']}))
export class DefaultUserUpdatableCrudRepository<
  T extends UserUpdatableEntity,
  ID,
  Relations extends object = {},
> extends DefaultTransactionalSoftCrudRepository<T, ID, Relations> {}

export interface DefaultUserUpdatableCrudRepository<T extends UserUpdatableEntity, ID, Relations extends object = {}>
  extends UserUpdatableRepository<T, ID, Relations> {}
