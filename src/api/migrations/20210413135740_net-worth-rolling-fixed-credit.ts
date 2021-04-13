import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('net_worth_subcategories', (table) => {
    table.float('appreciation_rate').defaultTo(null);
  });

  await knex.schema.renameTable('net_worth_mortgage_values', 'net_worth_loan_values');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('net_worth_loan_values', 'net_worth_mortgage_values');

  await knex.schema.table('net_worth_subcategories', (table) => {
    table.dropColumn('appreciation_rate');
  });
}
