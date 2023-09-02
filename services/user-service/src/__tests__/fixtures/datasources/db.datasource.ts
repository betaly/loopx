import {inject, LifeCycleObserver, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import temp from 'temp';

import {UserTenantDataSourceName} from '../../../keys';

const config = {
  name: UserTenantDataSourceName,
  connector: 'sqlite3s',
  localStorage: '',
  file: temp.path('.db'),
};

@lifeCycleObserver('datasource')
export class AuthenticationDbDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = UserTenantDataSourceName;

  constructor(
    @inject(`datasources.config.${UserTenantDataSourceName}`, {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
