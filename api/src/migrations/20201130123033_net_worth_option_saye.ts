import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_subcategories', (table) => {
    table.boolean('is_saye').nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_subcategories', (table) => {
    table.dropColumn('is_saye');
  });
}
