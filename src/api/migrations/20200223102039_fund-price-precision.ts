import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fund_cache', (table) => {
    table.specificType('price', 'double precision').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('fund_cache', (table) => {
    table.float('price').alter();
  });
}
