import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('net_worth_subcategories', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

    table
      .uuid('category_id')
      .notNullable()
      .references('net_worth_categories.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.string('subcategory');

    table.boolean('has_credit_limit');

    table.float('opacity').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('net_worth_subcategories');
}
