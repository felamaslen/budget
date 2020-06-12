import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('fund_hash', (table) => {
    table.uuid('fid').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('broker').notNullable();
    table.string('hash').notNullable();
    table.unique(['broker', 'hash']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('fund_hash');
}
