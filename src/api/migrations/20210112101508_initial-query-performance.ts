import Knex from 'knex';

const dateTables = ['net_worth', 'income', 'bills', 'food', 'general', 'holiday', 'social'];

export async function up(knex: Knex): Promise<void> {
  await Promise.all(
    dateTables.map((tableName) =>
      knex.schema.alterTable(tableName, (table) => {
        table.index('date');
      }),
    ),
  );
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all(
    dateTables.map((tableName) =>
      knex.schema.alterTable(tableName, (table) => {
        table.dropIndex('date');
      }),
    ),
  );
}
