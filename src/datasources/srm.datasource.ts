import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver
} from '@loopback/core';
import {
  juggler
} from '@loopback/repository';
import nconf from 'nconf';

const dbConfig = nconf.get('postgresConfig');
const pgsqlconfig = {
  name: dbConfig.name,
  connector: dbConfig.connector,
  url: process?.env?.PG_SQL_DB_URL || dbConfig.url,
  host: process?.env?.PG_SQL_DB_HOST || dbConfig.host,
  port: process?.env?.PG_SQL_DB_PORT || dbConfig.port,
  user: process?.env?.PG_SQL_DB_USER || dbConfig.user,
  password: process?.env?.PG_SQL_DB_PASSWORD || dbConfig.password,
  database: dbConfig.database

};

@lifeCycleObserver('datasource')
export class SrmDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = pgsqlconfig.name;
  static readonly defaultConfig = pgsqlconfig;

  constructor(
    @inject('datasources.config.pgsqldb', {
      optional: true
    })
    dsConfig: object = pgsqlconfig,
  ) {
    super(dsConfig);
  }
}
