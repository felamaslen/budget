import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('net_worth_currencies', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('net_worth_id')
      .notNullable()
      .references('net_worth.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('currency');

    table.index(['net_worth_id', 'currency']);

    table.specificType('rate', 'double precision').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth_currencies');
}
