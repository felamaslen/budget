import Knex from 'knex';

const fundSalt = 'a963anx2';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.schema.renameTable('fund_hash', 'fund_scrape');
    await trx.schema.alterTable('fund_scrape', (table) => {
      table.string('item').index();
    });

    await trx.raw(
      `
    UPDATE fund_scrape
    SET item = funds.item
    FROM funds
    WHERE md5(funds.item || ?) = fund_scrape.hash
    `,
      [fundSalt],
    );

    await trx('fund_scrape').where({ item: null }).del();

    await trx.schema.alterTable('fund_scrape', (table) => {
      table.dropColumn('hash');
      table.string('item').notNullable().alter();
      table.unique(['broker', 'item']);
    });

    await trx.commit();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.schema.renameTable('fund_scrape', 'fund_hash');
    await trx.schema.alterTable('fund_hash', (table) => {
      table.string('hash');
    });

    await trx.raw(
      `
    UPDATE fund_hash
    SET hash = md5(funds.item || ?)
    FROM funds
    WHERE funds.item = fund_hash.item
    `,
      [fundSalt],
    );

    await trx('fund_hash').where({ hash: null }).del();

    await trx.schema.alterTable('fund_hash', (table) => {
      table.dropColumn('item');
      table.string('hash').notNullable().alter();
    });

    await trx.commit();
  });
}
