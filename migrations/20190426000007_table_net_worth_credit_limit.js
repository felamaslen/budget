const up = knex => knex.schema.createTable('net_worth_credit_limit', table => {
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

    table.primary(['net_worth_id', 'subcategory']);

    table.integer('value')
        .unsigned()
        .notNullable();
});

const down = knex => knex.schema.dropTable('net_worth_credit_limit');

module.exports = { up, down };
