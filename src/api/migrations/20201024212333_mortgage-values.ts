import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('net_worth_mortgage_values', (table) => {
    table
      .integer('values_id')
      .primary()
      .notNullable()
      .references('net_worth_values.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.integer('payments_remaining').notNullable();
    table.float('rate').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth_mortgage_values');
}
