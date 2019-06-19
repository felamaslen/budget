const up = knex => knex.schema.createTable('balance', table => {
    table.increments('id').unsigned()
        .primary();
    table.integer('uid').unsigned()
        .notNullable();
    table.foreign('uid').references('users.uid');
    table.date('date').notNullable();
    table.bigInteger('value').notNullable();

    table.unique(['uid', 'date']);
});

const down = knex => knex.schema.dropTable('balance');

module.exports = { up, down };
