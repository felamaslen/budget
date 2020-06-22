import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await trx.schema.alterTable('fund_cache', (table) => {
        table.dropForeign(['fid']);
        table.dropForeign(['cid']);
        table.dropColumn('id');
        table.renameColumn('fid', 'fid_old');
        table.renameColumn('cid', 'cid_old');
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.increments('id').primary();
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.integer('fid').index();
        table.integer('cid').index();
      });
      await trx.schema.alterTable('fund_hash', (table) => {
        table.dropPrimary('fund_hash_pkey');
        table.renameColumn('fid', 'fid_old');
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.dropPrimary('fund_cache_time_pkey');
        table.renameColumn('cid', 'cid_old');
      });
      await trx.schema.alterTable('fund_hash', (table) => {
        table.increments('fid').primary();
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.increments('cid').primary();
      });
      await trx.raw(`
      UPDATE fund_cache
      SET fid = fund_hash.fid
      FROM fund_hash
      WHERE fund_hash.fid_old = fund_cache.fid_old
      `);
      await trx.raw(`
      UPDATE fund_cache
      SET cid = fund_cache_time.cid
      FROM fund_cache_time
      WHERE fund_cache_time.cid_old = fund_cache.cid_old
      `);
      await trx.schema.alterTable('fund_hash', (table) => {
        table.dropColumn('fid_old');
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.foreign('fid').references('fund_hash.fid').onUpdate('CASCADE').onDelete('CASCADE');
        table
          .foreign('cid')
          .references('fund_cache_time.cid')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table.dropColumn('fid_old');
        table.dropColumn('cid_old');
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.dropColumn('cid_old');
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
      await trx.schema.alterTable('fund_cache', (table) => {
        table.dropForeign(['fid']);
        table.dropForeign(['cid']);
        table.dropColumn('id');
        table.renameColumn('fid', 'fid_new');
        table.renameColumn('cid', 'cid_new');
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.uuid('id').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.uuid('fid');
        table.uuid('cid');
      });
      await trx.schema.alterTable('fund_hash', (table) => {
        table.dropPrimary('fund_hash_pkey');
        table.renameColumn('fid', 'fid_new');
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.dropPrimary('fund_cache_time_pkey');
        table.renameColumn('cid', 'cid_new');
      });
      await trx.schema.alterTable('fund_hash', (table) => {
        table.uuid('fid').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.uuid('cid').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });
      await trx.raw(`
      UPDATE fund_cache
      SET fid = fund_hash.fid
      FROM fund_hash
      WHERE fund_hash.fid_new = fund_cache.fid_new
      `);
      await trx.raw(`
      UPDATE fund_cache
      SET cid = fund_cache_time.cid
      FROM fund_cache_time
      WHERE fund_cache_time.cid_new = fund_cache.cid_new
      `);
      await trx.schema.alterTable('fund_hash', (table) => {
        table.dropColumn('fid_new');
      });
      await trx.schema.alterTable('fund_cache', (table) => {
        table.foreign('fid').references('fund_hash.fid').onUpdate('CASCADE').onDelete('CASCADE');
        table
          .foreign('cid')
          .references('fund_cache_time.cid')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table.dropColumn('fid_new');
        table.dropColumn('cid_new');
      });
      await trx.schema.alterTable('fund_cache_time', (table) => {
        table.dropColumn('cid_new');
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
