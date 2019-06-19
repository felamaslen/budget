const up = knex => knex.schema.createTable('funds_transactions', table => {
    table.increments('id').unsigned()
        .primary();
    table.integer('fund_id')
        .unsigned()
        .references('funds.id')
        .onDelete('CASCADE');

    table.date('date').notNullable();
    table.double('units').notNullable();
    table.integer('cost').notNullable();
});

const down = knex => knex.schema.dropTable('funds_transactions');

module.exports = { up, down };
