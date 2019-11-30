import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('stock_codes', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('name').notNullable();
    table.string('code');
    table.unique(['name', 'code']);
  });

exports.down = (knex: Knex) => knex.schema.dropTable('stock_codes');
