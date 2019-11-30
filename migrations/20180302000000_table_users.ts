import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('users', table => {
    table
      .uuid('uid')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('name').notNullable();
    table
      .string('pin_hash')
      .unique()
      .notNullable();
  });

exports.down = (knex: Knex) => knex.schema.dropTable('users');
