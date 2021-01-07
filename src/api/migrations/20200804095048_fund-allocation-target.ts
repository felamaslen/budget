import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('funds', (table) => {
    table.float('allocation_target');
  });

  await knex.schema.createTable('funds_cash_target', (table) => {
    table.integer('uid').primary().references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');
    table.integer('allocation_target');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('funds_cash_target');

  await knex.schema.table('funds', (table) => {
    table.dropColumn('allocation_target');
  });
}
