const up = knex => knex.schema.createTable('funds', table => {
    table.increments('id').unsigned()
        .primary();
    table.integer('uid').unsigned()
        .notNullable()
        .references('users.uid')
        .onDelete('CASCADE');
    table.string('item').notNullable();
    table.unique(['uid', 'item']);
});

const down = knex => knex.schema.dropTable('funds');

module.exports = { up, down };
