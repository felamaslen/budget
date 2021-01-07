import Knex, { Transaction } from 'knex';

const idTables = [
  'net_worth',
  'net_worth_categories',
  'net_worth_subcategories',
  'net_worth_currencies',
  'net_worth_values',
  'net_worth_fx_values',
  'net_worth_option_values',
];

const categoryDependentTables = ['net_worth_subcategories'];
const subcategoryDependentTables = ['net_worth_values', 'net_worth_credit_limit'];
const entryDependentTables = ['net_worth_values', 'net_worth_currencies', 'net_worth_credit_limit'];
const valueDependentTables = ['net_worth_fx_values', 'net_worth_option_values'];

const prepareDependentTablesUp = async (
  trx: Transaction,
  tables: string[],
  key: string,
): Promise<void> => {
  await Promise.all(
    tables.map(async (tableName) => {
      await trx.schema.alterTable(tableName, (table) => {
        table.dropForeign([key]);
        table.renameColumn(key, `${key}_old`);
      });
      await trx.schema.alterTable(tableName, (table) => {
        table.integer(key).index();
      });
    }),
  );
};

const prepareDependentTablesDown = async (
  trx: Transaction,
  tables: string[],
  key: string,
): Promise<void> => {
  await Promise.all(
    tables.map(async (tableName) => {
      await trx.schema.alterTable(tableName, (table) => {
        table.dropForeign([key]);
        table.renameColumn(key, `${key}_old`);
      });
      await trx.schema.alterTable(tableName, (table) => {
        table.uuid(key);
      });
    }),
  );
};

const updateDependentTables = async (
  trx: Transaction,
  tables: string[],
  key: string,
  foreignTable: string,
): Promise<void> => {
  await Promise.all(
    tables.map(async (tableName) => {
      await trx.raw(`
        UPDATE ${tableName}
        SET ${key} = ${foreignTable}.id
        FROM ${foreignTable}
        WHERE ${foreignTable}.id_old = ${tableName}.${key}_old
        `);

      await trx.schema.alterTable(tableName, (table) => {
        table.dropColumn(`${key}_old`);
        table.foreign(key).references(`${foreignTable}.id`).onUpdate('CASCADE').onDelete('CASCADE');
      });
    }),
  );
};

export async function up(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await prepareDependentTablesUp(trx, categoryDependentTables, 'category_id');
      await prepareDependentTablesUp(trx, subcategoryDependentTables, 'subcategory');
      await prepareDependentTablesUp(trx, entryDependentTables, 'net_worth_id');
      await prepareDependentTablesUp(trx, valueDependentTables, 'values_id');

      await Promise.all(
        idTables.map(async (tableName) => {
          await trx.schema.alterTable(tableName, (table) => {
            table.dropPrimary(`${tableName}_pkey`);
            table.renameColumn('id', 'id_old');
          });
          await trx.schema.alterTable(tableName, (table) => {
            table.increments('id').primary();
          });
        }),
      );

      await updateDependentTables(trx, valueDependentTables, 'values_id', 'net_worth_values');
      await updateDependentTables(trx, entryDependentTables, 'net_worth_id', 'net_worth');
      await updateDependentTables(
        trx,
        categoryDependentTables,
        'category_id',
        'net_worth_categories',
      );
      await updateDependentTables(
        trx,
        subcategoryDependentTables,
        'subcategory',
        'net_worth_subcategories',
      );

      await Promise.all(
        subcategoryDependentTables.map((tableName) =>
          trx.schema.alterTable(tableName, (table) => {
            table.unique(['net_worth_id', 'subcategory']);
          }),
        ),
      );

      await knex.schema.alterTable('net_worth_fx_values', (table) => {
        table.unique(['values_id', 'currency']);
      });
      await knex.schema.alterTable('net_worth_currencies', (table) => {
        table.unique(['net_worth_id', 'currency']);
      });

      await Promise.all(
        idTables.map(async (tableName) => {
          await trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('id_old');
          });
        }),
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
      await prepareDependentTablesDown(trx, categoryDependentTables, 'category_id');
      await prepareDependentTablesDown(trx, subcategoryDependentTables, 'subcategory');
      await prepareDependentTablesDown(trx, entryDependentTables, 'net_worth_id');
      await prepareDependentTablesDown(trx, valueDependentTables, 'values_id');

      await Promise.all(
        idTables.map(async (tableName) => {
          await trx.schema.alterTable(tableName, (table) => {
            table.dropPrimary(`${tableName}_pkey`);
            table.renameColumn('id', 'id_old');
          });
          await trx.schema.alterTable(tableName, (table) => {
            table.uuid('id').primary().defaultTo(trx.raw('uuid_generate_v4()'));
          });
        }),
      );

      await updateDependentTables(trx, valueDependentTables, 'values_id', 'net_worth_values');
      await updateDependentTables(trx, entryDependentTables, 'net_worth_id', 'net_worth');
      await updateDependentTables(
        trx,
        categoryDependentTables,
        'category_id',
        'net_worth_categories',
      );
      await updateDependentTables(
        trx,
        subcategoryDependentTables,
        'subcategory',
        'net_worth_subcategories',
      );

      await Promise.all(
        idTables.map(async (tableName) => {
          await trx.schema.alterTable(tableName, (table) => {
            table.dropColumn('id_old');
          });
        }),
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
