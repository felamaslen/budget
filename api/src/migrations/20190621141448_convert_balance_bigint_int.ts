import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('balance', (table) => {
    table.integer('value').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('balance', (table) => {
    table.bigInteger('value').notNullable().alter();
  });
}
