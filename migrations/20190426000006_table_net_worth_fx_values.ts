import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('net_worth_fx_values', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('values_id')
      .notNullable()
      .references('net_worth_values.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.float('value');

    table.string('currency');
  });

exports.down = (knex: Knex) => knex.schema.dropTable('net_worth_fx_values');
