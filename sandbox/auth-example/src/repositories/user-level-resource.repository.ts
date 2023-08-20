import {Getter, inject} from '@loopback/core';
import {JugglerDataSource} from '@loopback/repository';

import {AuthDbSourceName} from '@loopx/authentication-service';
import {DefaultUserUpdatableCrudRepository} from '@loopx/core';

import {UserLevelResource} from '../models';
import {AuthenticationBindings} from '@bleco/authentication';
import {IAuthUserWithPermissions} from '@bleco/authorization';

export class UserLevelResourceRepository extends DefaultUserUpdatableCrudRepository<
  UserLevelResource,
  typeof UserLevelResource.prototype.id
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: JugglerDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
  ) {
    super(UserLevelResource, dataSource, getCurrentUser);
  }
}
