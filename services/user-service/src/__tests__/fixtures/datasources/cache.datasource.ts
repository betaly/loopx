import {inject, LifeCycleObserver, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {UserTenantCacheSourceName} from '../../../keys';

const config = {
  name: UserTenantCacheSourceName,
  connector: 'memory',
  localStorage: '',
  file: '',
};

@lifeCycleObserver('datasource')
export class AuthenticationCacheDbDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = UserTenantCacheSourceName;

  constructor(
    @inject(`datasources.config.${UserTenantCacheSourceName}`, {optional: true})
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
