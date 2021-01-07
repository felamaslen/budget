import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('funds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid').notNullable().references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');

    table.string('item').notNullable();
    table.unique(['uid', 'item']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('funds');
}
