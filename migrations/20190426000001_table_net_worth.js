const up = knex => knex.schema.createTable('net_worth', table => {
    table.increments('id')
        .primary();

    table.integer('uid').unsigned()
        .notNullable()
        .references('users.uid')
        .onDelete('CASCADE');

    table.date('date').notNullable();
});

const down = knex => knex.schema.dropTable('net_worth');

module.exports = { up, down };
