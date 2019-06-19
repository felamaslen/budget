const up = knex => knex.schema.createTable('net_worth_values', table => {
    table.increments('id')
        .primary();

    table.integer('net_worth_id')
        .unsigned()
        .notNullable()
        .references('net_worth.id')
        .onDelete('CASCADE');

    table.integer('subcategory')
        .unsigned()
        .notNullable()
        .references('net_worth_subcategories.id')
        .onDelete('CASCADE');

    table.integer('value');
});

const down = knex => knex.schema.dropTable('net_worth_values');

module.exports = { up, down };
