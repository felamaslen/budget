import * as Knex from 'knex';
import { createSearchIndex, dropSearchIndex } from './20190724135824_suggestions-search-index';

const tables = ['income', 'bills'];

export async function up(knex: Knex): Promise<void> {
  await Promise.all(
    tables.map(async (tableName) => {
      await knex.schema.alterTable(tableName, (table) => {
        table.string('category');
        table.string('shop');
      });
      await knex(tableName).update({ category: 'Unknown', shop: 'Unknown' });
      await knex.schema.alterTable(tableName, (table) => {
        table.string('category').notNullable().index().alter();
        table.string('shop').notNullable().index().alter();
      });

      await createSearchIndex(knex, tableName, 'category');
      await createSearchIndex(knex, tableName, 'shop');
    }),
  );
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all(
    tables.map(async (tableName) => {
      await dropSearchIndex(knex, tableName, 'category');
      await dropSearchIndex(knex, tableName, 'shop');

      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn('category');
        table.dropColumn('shop');
      });
    }),
  );
}
