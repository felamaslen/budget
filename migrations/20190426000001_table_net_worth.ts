import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('net_worth', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('uid')
      .notNullable()
      .references('users.uid')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.date('date').notNullable();
  });

exports.down = (knex: Knex) => knex.schema.dropTable('net_worth');
