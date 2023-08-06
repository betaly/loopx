import {inject} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';

import {LoginActivity} from '../models';
import {AuthDbSourceName} from '../types';

export class LoginActivityRepository extends DefaultCrudRepository<LoginActivity, typeof LoginActivity.prototype.id> {
  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
  ) {
    super(LoginActivity, dataSource);
  }
}
