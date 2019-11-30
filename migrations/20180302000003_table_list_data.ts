import * as Knex from 'knex';

const upTable = (knex: Knex) => ({
  tableName,
  full = false,
  categoryName = 'category',
}: {
  tableName: string;
  full?: boolean;
  categoryName?: string;
}) =>
  knex.schema.createTable(tableName, table => {
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
    table.string('item').notNullable();
    table.integer('cost').notNullable();

    if (full) {
      table
        .string(categoryName)
        .notNullable()
        .index();

      table
        .string('shop')
        .notNullable()
        .index();
    }
  });

const downTable = (knex: Knex) => ({ tableName }: { tableName: string }) =>
  knex.schema.dropTable(tableName);

const tableDefinitions = [
  { tableName: 'income' },
  { tableName: 'bills' },
  { tableName: 'food', full: true },
  { tableName: 'general', full: true },
  { tableName: 'social', full: true, categoryName: 'society' },
  { tableName: 'holiday', full: true, categoryName: 'holiday' },
];

exports.up = (knex: Knex) => Promise.all(tableDefinitions.map(upTable(knex)));

exports.down = (knex: Knex) => Promise.all(tableDefinitions.map(downTable(knex)));
