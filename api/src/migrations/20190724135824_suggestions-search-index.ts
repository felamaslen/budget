import Knex from 'knex';

type Table = { table: string; columns: string[] };

const tables: Table[] = [
  { table: 'income', columns: ['item'] },
  { table: 'bills', columns: ['item'] },
  { table: 'food', columns: ['item', 'category', 'shop'] },
  { table: 'general', columns: ['item', 'category', 'shop'] },
  { table: 'holiday', columns: ['item', 'holiday', 'shop'] },
  { table: 'social', columns: ['item', 'society', 'shop'] },
];

export async function up(knex: Knex): Promise<void> {
  await tables.reduce(
    (last, { table, columns }) =>
      last.then(() =>
        columns.reduce(
          (lastColumn, column) =>
            lastColumn.then(() =>
              knex.transaction(async (trx) => {
                await trx.raw(`
            ALTER TABLE "${table}"
            ADD COLUMN "${column}_search" TSVECTOR
            `);

                await trx.raw(`
            UPDATE "${table}"
            SET "${column}_search" = to_tsvector('english', "${column}")
            `);

                await trx.raw(`
            CREATE INDEX "${table}_${column}_search"
            ON "${table}"
            USING gin("${column}_search")
            `);

                await trx.raw(`
            CREATE TRIGGER "${table}_vector_update_${column}"
            BEFORE INSERT OR UPDATE ON "${table}"
            FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger(
              "${column}_search",
              'pg_catalog.english',
              "${column}"
            )
            `);
              }),
            ),
          Promise.resolve(),
        ),
      ),
    Promise.resolve(),
  );
}

export async function down(knex: Knex): Promise<void> {
  await tables.reduce(
    (last, { table, columns }) =>
      last.then(() =>
        columns.reduce(
          (lastColumn, column) =>
            lastColumn.then(() =>
              knex.transaction(async (trx) => {
                await trx.raw(`
            DROP TRIGGER "${table}_vector_update_${column}" ON "${table}"
            `);

                await trx.raw(`
            DROP INDEX "${table}_${column}_search"
            `);

                await trx.raw(`
            ALTER TABLE "${table}" DROP COLUMN "${column}_search"
            `);
              }),
            ),
          Promise.resolve(),
        ),
      ),
    Promise.resolve(),
  );
}
