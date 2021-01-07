import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_option_values', (table) => {
    table.integer('vested').notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_option_values', (table) => {
    table.dropColumn('vested');
  });
}
