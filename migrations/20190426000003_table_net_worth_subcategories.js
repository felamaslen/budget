const up = knex => knex.schema.createTable('net_worth_subcategories', table => {
    table.increments('id')
        .primary();

    table.integer('category_id')
        .unsigned()
        .notNullable()
        .references('net_worth_categories.id')
        .onDelete('CASCADE');

    table.string('subcategory');

    table.boolean('has_credit_limit');

    table.float('opacity')
        .defaultTo(0);
});

const down = knex => knex.schema.dropTable('net_worth_subcategories');

module.exports = { up, down };
