import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {EntityClass} from '@loopx/core';

import {UserCredentials, UserCredentialsTypes, UserTypes} from '../models';
import {AuthDbSourceName} from '../types';
import {UserRepository} from './user.repository';

export class UserCredentialsRepository<
  UC extends UserCredentialsTypes = UserCredentialsTypes,
  U extends UserTypes = UserTypes,
> extends DefaultSoftCrudRepository<UC['Model'], UC['ID'], UC['Relations']> {
  public readonly user: BelongsToAccessor<U['Model'], UC['ID']>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
    entityClass: EntityClass<UC['Model']> = UserCredentials,
  ) {
    super(entityClass, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
