import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('balance', table => {
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
    table.bigInteger('value').notNullable();

    table.unique(['uid', 'date']);
  });

exports.down = (knex: Knex) => knex.schema.dropTable('balance');
