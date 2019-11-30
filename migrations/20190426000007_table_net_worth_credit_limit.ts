import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('net_worth_credit_limit', table => {
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

    table.primary(['net_worth_id', 'subcategory']);

    table
      .integer('value')
      .unsigned()
      .notNullable();
  });

exports.down = (knex: Knex) => knex.schema.dropTable('net_worth_credit_limit');
