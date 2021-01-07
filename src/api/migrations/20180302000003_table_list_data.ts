import Knex from 'knex';

type TableDefinition = { tableName: string; full?: boolean; categoryName?: string };

const tableDefinitions: TableDefinition[] = [
  { tableName: 'income' },
  { tableName: 'bills' },
  { tableName: 'food', full: true },
  { tableName: 'general', full: true },
  { tableName: 'social', full: true, categoryName: 'society' },
  { tableName: 'holiday', full: true, categoryName: 'holiday' },
];

const upTable = (knex: Knex) => async ({
  tableName,
  full = false,
  categoryName = 'category',
}: TableDefinition): Promise<void> => {
  await knex.schema.createTable(tableName, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid').notNullable().references('users.uid').onUpdate('CASCADE').onDelete('CASCADE');

    table.date('date').notNullable();
    table.string('item').notNullable();
    table.integer('cost').notNullable();

    if (full) {
      table.string(categoryName).notNullable().index();

      table.string('shop').notNullable().index();
    }
  });
};

const downTable = (knex: Knex) => async ({ tableName }: TableDefinition): Promise<void> => {
  await knex.schema.dropTable(tableName);
};

export async function up(knex: Knex): Promise<void> {
  await Promise.all(tableDefinitions.map(upTable(knex)));
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all(tableDefinitions.map(downTable(knex)));
}
