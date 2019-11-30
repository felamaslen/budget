import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.createTable('ip_login_req', table => {
    table.string('ip').primary();
    table.timestamp('time').notNullable();
    table
      .integer('count')
      .notNullable()
      .defaultTo(0);
  });

exports.down = (knex: Knex) => knex.schema.dropTable('ip_login_req');
