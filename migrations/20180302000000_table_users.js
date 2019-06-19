const up = knex => knex.schema.createTable('users', table => {
    table.increments('uid').unsigned()
        .primary();
    table.string('name').notNullable();
    table.string('pin_hash').unique()
        .notNullable();
});

const down = knex => knex.schema.dropTable('users');

module.exports = { up, down };
