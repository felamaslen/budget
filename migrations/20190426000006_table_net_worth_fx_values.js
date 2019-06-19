const up = knex => knex.schema.createTable('net_worth_fx_values', table => {
    table.increments('id')
        .primary();

    table.integer('values_id')
        .unsigned()
        .notNullable()
        .references('net_worth_values.id')
        .onDelete('CASCADE');

    table.float('value');

    table.string('currency');
});

const down = knex => knex.schema.dropTable('net_worth_fx_values');

module.exports = { up, down };
