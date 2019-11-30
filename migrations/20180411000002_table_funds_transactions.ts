import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('funds_transactions', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('fund_id')
      .unsigned()
      .references('funds.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.date('date').notNullable();
    table.float('units').notNullable();
    table.integer('cost').notNullable();
  });

exports.down = (knex: Knex) => knex.schema.dropTable('funds_transactions');
