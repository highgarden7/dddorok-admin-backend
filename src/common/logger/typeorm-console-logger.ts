import { Logger, QueryRunner } from 'typeorm';

export class TypeOrmConsoleLogger implements Logger {
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    console.log('\x1b[34m[QUERY]\x1b[0m', query);
    if (parameters?.length) {
      console.log('\x1b[33m[PARAMS]\x1b[0m', JSON.stringify(parameters));
    }
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    console.error('\x1b[31m[QUERY ERROR]\x1b[0m', error);
    console.error(query);
    if (parameters?.length) {
      console.error('Params:', JSON.stringify(parameters));
    }
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    console.warn('\x1b[35m[SLOW QUERY]\x1b[0m', `${time}ms`, query);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    console.log('[SCHEMA BUILD]', message);
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    console.log('[MIGRATION]', message);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    console[level](message);
  }
}
