import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('fund_cache_time', (table) => {
    table.uuid('cid').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.dateTime('time').index().notNullable();
    table.boolean('done');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('fund_cache_time');
}
