import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('funds_stock_splits', (table) => {
    table.increments('id').primary();
    table.integer('fund_id').references('funds.id').onDelete('CASCADE').onUpdate('CASCADE');
    table.date('date');
    table.float('ratio');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('funds_stock_splits');
}
