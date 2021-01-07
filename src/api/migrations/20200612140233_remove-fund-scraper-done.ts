import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`DELETE FROM fund_cache_time WHERE done = FALSE`);
  await knex.schema.alterTable('fund_cache_time', (table) => {
    table.dropColumn('done');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fund_cache_time', (table) => {
    table.boolean('done').defaultTo(true);
  });
}
