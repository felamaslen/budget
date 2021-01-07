import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  const user = await knex('users').select<{ uid: number }>('uid').first();

  await knex.transaction(async (trx) => {
    await knex.schema.alterTable('net_worth_categories', (table) => {
      table.integer('uid');
    });

    if (user) {
      await knex.raw(`UPDATE net_worth_categories SET uid = ?`, [user.uid]);
    }

    await knex.schema.alterTable('net_worth_categories', (table) => {
      table.foreign('uid').references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');
    });

    await trx.commit();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('net_worth_categories', (table) => {
    table.dropColumn('uid');
  });
}
