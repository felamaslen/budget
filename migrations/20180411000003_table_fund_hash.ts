import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('fund_hash', table => {
    table
      .uuid('fid')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('broker').notNullable();
    table.string('hash').notNullable();
    table.unique(['broker', 'hash']);
  });

exports.down = (knex: Knex) => knex.schema.dropTable('fund_hash');
