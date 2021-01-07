import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('net_worth_fx_values', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('values_id')
      .notNullable()
      .references('net_worth_values.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.float('value');

    table.string('currency');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth_fx_values');
}
