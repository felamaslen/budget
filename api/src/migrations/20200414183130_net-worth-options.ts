import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_categories', (table) => {
    table.boolean('is_option').defaultTo(false);
  });

  await knex.schema.createTable('net_worth_option_values', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('values_id')
      .notNullable()
      .references('net_worth_values.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.float('units');
    // Both strike_price and market_price are in GBX
    table.float('strike_price');
    table.float('market_price');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth_option_values');

  await knex.schema.alterTable('net_worth_categories', (table) => {
    table.dropColumn('is_option');
  });
}
