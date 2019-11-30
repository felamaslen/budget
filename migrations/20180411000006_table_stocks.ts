import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('stocks', table => {
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

    table.string('name').notNullable();
    table.string('code');
    table.float('weight');
    table.float('subweight');
  });

exports.down = (knex: Knex) => knex.schema.dropTable('stocks');
