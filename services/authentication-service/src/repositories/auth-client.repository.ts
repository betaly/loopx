import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {EntityClass} from '@loopx/core';

import {AuthClient, AuthClientTypes} from '../models';
import {AuthDbSourceName} from '../types';

export class AuthClientRepository<T extends AuthClientTypes = AuthClientTypes> extends DefaultSoftCrudRepository<
  T['Model'],
  T['ID']
> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    entityClass: EntityClass<T['Model']> = AuthClient,
  ) {
    super(entityClass, dataSource);
  }
}
