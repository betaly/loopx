import {Getter, inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

import {AuthenticationBindings} from '@bleco/authentication';

import {DefaultUserUpdatableCrudRepository, EntityClass, IAuthUserWithPermissions} from '@loopx/core';

import {Role, RoleModelTypes} from '../models';
import {AuthDbSourceName} from '../types';

export class RoleRepository<T extends RoleModelTypes = RoleModelTypes> extends DefaultUserUpdatableCrudRepository<
  T['Model'],
  T['ID']
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
    entityClass: EntityClass<T['Model']> = Role,
  ) {
    super(entityClass, dataSource, getCurrentUser);
  }
}
