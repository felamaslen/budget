import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('funds_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('fund_id').unsigned().references('funds.id').onUpdate('CASCADE').onDelete('CASCADE');

    table.date('date').notNullable();
    table.specificType('units', 'double precision').notNullable();
    table.integer('cost').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('funds_transactions');
}
