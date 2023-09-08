import {Getter, inject} from '@loopback/core';
import {JugglerDataSource} from '@loopback/repository';

import {AuthenticationBindings} from '@bleco/authentication';

import {AuthDbSourceName} from '@loopx/authentication-service';
import {DefaultUserUpdatableCrudRepository, IAuthTenantUser} from '@loopx/core';

import {UserLevelResource} from '../models';

export class UserLevelResourceRepository extends DefaultUserUpdatableCrudRepository<
  UserLevelResource,
  typeof UserLevelResource.prototype.id
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: JugglerDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(UserLevelResource, dataSource, getCurrentUser);
  }
}
