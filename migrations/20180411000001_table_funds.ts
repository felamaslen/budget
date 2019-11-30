import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('funds', table => {
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

    table.string('item').notNullable();
    table.unique(['uid', 'item']);
  });

exports.down = (knex: Knex) => knex.schema.dropTable('funds');
