const up = knex => knex.schema.createTable('net_worth_categories', table => {
    table.increments('id')
        .primary();

    table.enu('type', ['asset', 'liability'])
        .notNullable();

    table.string('category');

    table.index(['type', 'category']);

    table.string('color');
});

const down = knex => knex.schema.dropTable('net_worth_categories');

module.exports = { up, down };
