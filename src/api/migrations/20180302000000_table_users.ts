import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await trx.schema.createTable('users', (table) => {
      table.uuid('uid').primary().defaultTo(knex.raw('uuid_generate_v4()'));

      table.string('name').notNullable();
      table.string('pin_hash').unique().notNullable();
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.raw('DROP TABLE users CASCADE');
    await trx.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
  });
}
