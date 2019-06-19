const up = knex => knex.schema.createTable('stocks', table => {
    table.increments('id').unsigned()
        .primary();
    table.integer('uid').unsigned()
        .notNullable()
        .references('users.uid')
        .onDelete('CASCADE');

    table.string('name').notNullable();
    table.string('code');
    table.float('weight');
    table.float('subweight');
});

const down = knex => knex.schema.dropTable('stocks');

module.exports = { up, down };
