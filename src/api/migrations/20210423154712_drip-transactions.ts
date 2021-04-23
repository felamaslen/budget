import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('funds_transactions', (table) => {
    table.boolean('is_drip').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('funds_transactions', (table) => {
    table.dropColumn('is_drip');
  });
}
