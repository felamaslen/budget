import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  let migrationError: Error | undefined;

  await knex.transaction(async (trx) => {
    try {
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.dropColumn('id');
        table.dropForeign(['fund_id']);
        table.renameColumn('fund_id', 'fund_id_old');
      });
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.increments('id').primary();
      });
      await trx.schema.alterTable('funds', (table) => {
        table.dropPrimary('funds_pkey');
        table.renameColumn('id', 'id_old');
      });
      await trx.schema.alterTable('funds', (table) => {
        table.increments('id').primary();
      });
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.integer('fund_id').index();
      });
      await trx.raw(`
      UPDATE funds_transactions
      SET fund_id = funds.id
      FROM funds
      WHERE funds.id_old = funds_transactions.fund_id_old
      `);
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.foreign('fund_id').references('funds.id').onUpdate('CASCADE').onDelete('CASCADE');
        table.dropColumn('fund_id_old');
      });
      await trx.schema.alterTable('funds', (table) => {
        table.dropColumn('id_old');
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
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.dropColumn('id');
        table.dropForeign(['fund_id']);
        table.renameColumn('fund_id', 'fund_id_new');
      });
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.uuid('id').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });
      await trx.schema.alterTable('funds', (table) => {
        table.dropPrimary('funds_pkey');
        table.renameColumn('id', 'id_new');
      });
      await trx.schema.alterTable('funds', (table) => {
        table.uuid('id').primary().defaultTo(trx.raw('uuid_generate_v4()'));
      });
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.uuid('fund_id');
      });
      await trx.raw(`
      UPDATE funds_transactions
      SET fund_id = funds.id
      FROM funds
      WHERE funds.id_new = funds_transactions.fund_id_new
      `);
      await trx.schema.alterTable('funds_transactions', (table) => {
        table.foreign('fund_id').references('funds.id');
        table.dropColumn('fund_id_new');
      });
      await trx.schema.alterTable('funds', (table) => {
        table.dropColumn('id_new');
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
