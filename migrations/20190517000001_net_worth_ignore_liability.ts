import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.table('net_worth_values', table => {
    table.boolean('skip').defaultTo(null);
  });

exports.down = (knex: Knex) =>
  knex.schema.table('net_worth_values', table => {
    table.dropColumn('skip');
  });
