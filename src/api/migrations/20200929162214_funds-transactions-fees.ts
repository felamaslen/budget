import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('funds_transactions', (table) => {
    table.specificType('price', 'double precision').notNullable().defaultTo(0);
    table.integer('fees').notNullable().defaultTo(0);
    table.integer('taxes').notNullable().defaultTo(0);
  });

  await knex.raw(`
  UPDATE funds_transactions
  SET price = cost / units
  `);

  await knex.schema.alterTable('funds_transactions', (table) => {
    table.dropColumn('cost');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('funds_transactions', (table) => {
    table.integer('cost').notNullable().defaultTo(0);
  });

  await knex.raw(`
  UPDATE funds_transactions
  SET cost = price * units + fees + taxes
  `);

  await knex.schema.alterTable('funds_transactions', (table) => {
    table.dropColumn('price');
    table.dropColumn('fees');
    table.dropColumn('taxes');
  });
}
