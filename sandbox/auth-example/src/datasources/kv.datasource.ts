import {inject, LifeCycleObserver, lifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'kv',
  connector: 'kv-memory',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class KvDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'kv';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.kv', {optional: true})
    dsConfig: object = config,
  ) {
    super({...config, ...dsConfig});
  }
}
