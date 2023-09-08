import {inject, LifeCycleObserver, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {UserCacheSourceName} from '@loopx/user-core';

const config = {
  name: UserCacheSourceName,
  connector: 'memory',
  localStorage: '',
  file: '',
};

@lifeCycleObserver('datasource')
export class AuthenticationCacheDbDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = UserCacheSourceName;

  constructor(
    @inject(`datasources.config.${UserCacheSourceName}`, {optional: true})
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
