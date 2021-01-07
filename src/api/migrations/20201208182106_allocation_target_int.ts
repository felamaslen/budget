import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  UPDATE funds SET allocation_target = CASE WHEN
  allocation_target IS NULL THEN NULL
  ELSE (allocation_target * 100)::integer
  END
  `);

  await knex.schema.alterTable('funds', (table) => {
    table.integer('allocation_target').unsigned().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('funds', (table) => {
    table.float('allocation_target').unsigned().alter();
  });

  await knex.raw(`
  UPDATE funds SET allocation_target = CASE WHEN
  allocation_target IS NULL THEN NULL
  ELSE allocation_target / 100
  END
  `);
}
