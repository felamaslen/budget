import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('net_worth_values', (table) => {
    table.boolean('skip').defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('net_worth_values', (table) => {
    table.dropColumn('skip');
  });
}
