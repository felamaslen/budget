import Knex from 'knex';

const tablesReferencingUsersUid = [
  'net_worth',
  'bills',
  'income',
  'funds',
  'food',
  'general',
  'holiday',
  'social',
  'stocks',
];

export async function up(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropForeign(['uid']);
            table.renameColumn('uid', 'uid_old');
          }),
        ),
      );

      await trx.schema.alterTable('users', (table) => {
        table.dropPrimary('users_pkey');
        table.renameColumn('uid', 'uid_old');
      });

      await trx.schema.alterTable('users', (table) => {
        table.increments('uid').primary();
      });

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.integer('uid').index();
          }),
        ),
      );

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.raw(`
        UPDATE ${tableName}
        SET uid = users.uid
        FROM users
        WHERE users.uid_old = ${tableName}.uid_old
        `),
        ),
      );

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('uid_old');
            table.foreign('uid').references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');
          }),
        ),
      );

      await trx.schema.alterTable('users', (table) => {
        table.dropColumn('uid_old');
      });

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
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropForeign(['uid']);
            table.renameColumn('uid', 'uid_new');
          }),
        ),
      );

      await trx.schema.alterTable('users', (table) => {
        table.dropPrimary('users_pkey');
        table.renameColumn('uid', 'uid_new');
      });

      await trx.schema.alterTable('users', (table) => {
        table.uuid('uid').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.uuid('uid');
          }),
        ),
      );

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.raw(`
        UPDATE ${tableName}
        SET uid = users.uid
        FROM users
        WHERE users.uid_new = ${tableName}.uid_new
        `),
        ),
      );

      await Promise.all(
        tablesReferencingUsersUid.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('uid_new');
            table.foreign('uid').references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');
          }),
        ),
      );

      await trx.schema.alterTable('users', (table) => {
        table.dropColumn('uid_new');
      });

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
