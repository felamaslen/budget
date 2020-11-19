import * as getenv from 'getenv';

export const getDbUrl = (): string =>
  process.env.NODE_ENV === 'test'
    ? getenv.string('TEST_DATABASE_URL', 'postgres://docker:docker@localhost:5440/budget_test')
    : getenv.string('DATABASE_URL');

export function withDatabaseName(url: string, databaseName?: string): string {
  const [, main, originalName] = url.match(/^(.*)\/(\w+)$/) as RegExpMatchArray;
  return `${main}/${databaseName ?? originalName}`;
}
