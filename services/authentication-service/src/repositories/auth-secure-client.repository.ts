import {DefaultSoftCrudRepository} from '@bleco/soft-delete';
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

import {AuthSecureClient, AuthSecureClientTypes} from '../models';
import {AuthDbSourceName} from '../types';

export class AuthSecureClientRepository<
  T extends AuthSecureClientTypes = AuthSecureClientTypes,
> extends DefaultSoftCrudRepository<T['Model'], T['ID']> {
  constructor(@inject(`datasources.${AuthDbSourceName}`) dataSource: juggler.DataSource) {
    super(AuthSecureClient, dataSource);
  }
}
