import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('fund_cache', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('cid').references('fund_cache_time.cid').onUpdate('CASCADE').onDelete('CASCADE');

    table.uuid('fid').references('fund_hash.fid').onUpdate('CASCADE').onDelete('CASCADE');

    table.float('price');
    table.unique(['cid', 'fid']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('fund_cache');
}
