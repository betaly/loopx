import {inject, LifeCycleObserver, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {UserDataSourceName} from '@loopx/user-core';
import temp from 'temp';

const config = {
  name: UserDataSourceName,
  connector: 'sqlite3s',
  localStorage: '',
  file: temp.path('.db'),
};

@lifeCycleObserver('datasource')
export class AuthenticationDbDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = UserDataSourceName;

  constructor(
    @inject(`datasources.config.${UserDataSourceName}`, {optional: true})
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
