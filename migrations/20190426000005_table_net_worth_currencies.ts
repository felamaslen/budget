import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('net_worth_currencies', table => {
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

    table.string('currency');

    table.index(['net_worth_id', 'currency']);

    table.float('rate');
  });

exports.down = (knex: Knex) => knex.schema.dropTable('net_worth_currencies');
