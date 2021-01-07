import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ip_login_req', (table) => {
    table.string('ip').primary();
    table.timestamp('time').notNullable();
    table.integer('count').notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('ip_login_req');
}
