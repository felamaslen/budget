import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('stock_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('name').notNullable();
    table.string('code');
    table.unique(['name', 'code']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('stock_codes');
}
