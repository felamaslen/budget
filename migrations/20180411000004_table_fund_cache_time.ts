import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('fund_cache_time', table => {
    table
      .uuid('cid')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .dateTime('time')
      .index()
      .notNullable();
    table.boolean('done');
  });

exports.down = (knex: Knex) => knex.schema.dropTable('fund_cache_time');
