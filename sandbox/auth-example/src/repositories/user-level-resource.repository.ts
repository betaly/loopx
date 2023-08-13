import {Getter, inject} from '@loopback/core';

import {AuthenticationBindings} from '@bleco/authentication';
import {UserLevelResource} from '../models';
import {JugglerDataSource} from '@loopback/repository';
import {DefaultUserUpdatableCrudRepository} from '@loopx/core';
import {AuthDbSourceName} from '@loopx/authentication-service';
import {IAuthUserWithPermissions} from '@bleco/authorization';

export class UserLevelResourceRepository extends DefaultUserUpdatableCrudRepository<
  UserLevelResource,
  typeof UserLevelResource.prototype.id
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`) dataSource: JugglerDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    getCurrentUser: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserLevelResource, dataSource, getCurrentUser);
  }
}
