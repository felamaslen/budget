import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('net_worth_values', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('net_worth_id')
      .notNullable()
      .references('net_worth.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table
      .uuid('subcategory')
      .notNullable()
      .references('net_worth_subcategories.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.integer('value');
  });

exports.down = (knex: Knex) => knex.schema.dropTable('net_worth_values');
