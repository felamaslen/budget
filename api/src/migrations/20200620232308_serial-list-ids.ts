import Knex from 'knex';

const idTables = [
  'income',
  'bills',
  'food',
  'general',
  'holiday',
  'social',
  'stocks',
  'stock_codes',
];

export async function up(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await Promise.all(
        idTables.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('id');
          }),
        ),
      );

      await Promise.all(
        idTables.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.increments('id').primary();
          }),
        ),
      );

      await trx.commit();
    } catch (err) {
      await trx.rollback();

      migrationError = err;
    }
  });

  if (migrationError) {
    throw migrationError;
  }
}

export async function down(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await Promise.all(
        idTables.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('id');
          }),
        ),
      );

      await Promise.all(
        idTables.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.uuid('id').primary().defaultTo(trx.raw('uuid_generate_v4()'));
          }),
        ),
      );

      await trx.commit();
    } catch (err) {
      await trx.rollback();

      migrationError = err;
    }
  });

  if (migrationError) {
    throw migrationError;
  }
}
