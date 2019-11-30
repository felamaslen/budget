import * as Knex from 'knex';

exports.up = (knex: Knex) =>
  knex.schema.alterTable('balance', table => {
    table
      .integer('value')
      .notNullable()
      .alter();
  });

exports.down = (knex: Knex) =>
  knex.schema.alterTable('balance', table => {
    table
      .bigInteger('value')
      .notNullable()
      .alter();
  });
