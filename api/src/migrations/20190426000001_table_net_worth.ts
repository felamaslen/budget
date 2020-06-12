import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('net_worth', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid').notNullable().references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');

    table.date('date').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth');
}
