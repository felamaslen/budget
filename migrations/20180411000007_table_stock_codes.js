const up = knex => knex.schema.createTable('stock_codes', table => {
    table.increments('id')
        .unsigned()
        .primary();
    table.string('name').notNullable();
    table.string('code');
    table.unique(['name', 'code']);
});

const down = knex => knex.schema.dropTable('stock_codes');

module.exports = { up, down };
