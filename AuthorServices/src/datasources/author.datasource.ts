import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'author',
  connector: 'mysql',
  url: '',
  host: 'localhost',
  port: 3306,
  user: 'rimanshu',
  password: 'Rimanshu@2025',
  database: 'author'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AuthorDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'author';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.author', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
