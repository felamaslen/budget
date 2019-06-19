const up = knex => knex.schema.createTable('net_worth_currencies', table => {
    table.increments('id')
        .primary();

    table.integer('net_worth_id')
        .unsigned()
        .notNullable()
        .references('net_worth.id')
        .onDelete('CASCADE');

    table.string('currency');

    table.index(['net_worth_id', 'currency']);

    table.double('rate');
});

const down = knex => knex.schema.dropTable('net_worth_currencies');

module.exports = { up, down };
