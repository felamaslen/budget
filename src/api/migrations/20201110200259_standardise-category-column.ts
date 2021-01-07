import * as Knex from 'knex';

async function createIndex(knex: Knex, table: string, column: string): Promise<void> {
  const trx = await knex.transaction();

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

  await trx.commit();
}

async function dropIndex(knex: Knex, table: string, column: string): Promise<void> {
  const trx = await knex.transaction();

  await trx.raw(`DROP TRIGGER "${table}_vector_update_${column}" ON "${table}"`);
  await trx.raw(`DROP INDEX "${table}_${column}_search"`);
  await trx.raw(`ALTER TABLE "${table}" DROP COLUMN "${column}_search"`);
  await trx.commit();
}

async function upTable(knex: Knex, table: string, column: string): Promise<void> {
  await dropIndex(knex, table, column);
  await knex.schema.alterTable(table, (tbl) => {
    tbl.dropIndex(column);
    tbl.renameColumn(column, 'category');
    tbl.index('category');
  });
  await createIndex(knex, table, 'category');
}

async function downTable(knex: Knex, table: string, column: string): Promise<void> {
  await dropIndex(knex, table, 'category');
  await knex.schema.alterTable(table, (tbl) => {
    tbl.dropIndex('category');
    tbl.renameColumn('category', column);
    tbl.index(column);
  });
  await createIndex(knex, table, column);
}

export async function up(knex: Knex): Promise<void> {
  await upTable(knex, 'holiday', 'holiday');
  await upTable(knex, 'social', 'society');
}

export async function down(knex: Knex): Promise<void> {
  await downTable(knex, 'holiday', 'holiday');
  await downTable(knex, 'social', 'society');
}
