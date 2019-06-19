const up = knex => knex.schema.createTable('ip_login_req', table => {
    table.string('ip').primary();
    table.timestamp('time').notNullable();
    table.integer('count').notNullable()
        .defaultTo(0);
});

const down = knex => knex.schema.dropTable('ip_login_req');

module.exports = { up, down };
