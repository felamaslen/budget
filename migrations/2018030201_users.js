/* eslint-disable newline-per-chained-call */

module.exports = {
    up: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('users'),
        knex.schema.dropTableIfExists('ip_login_req')
    ]).then(() => Promise.all([
        knex.schema.createTable('users', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('uid').unsigned().primary();
            table.string('name').notNullable();
            table.string('api_key').unique().notNullable();
        }),
        knex.schema.createTable('ip_login_req', table => {
            table.collate('utf8mb4_unicode_ci');

            table.string('ip').primary();
            table.timestamp('time').notNullable();
            table.integer('count').notNullable().defaultTo(0);
        })
    ])),
    down: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('users'),
        knex.schema.dropTableIfExists('ip_login_req')
    ])
};

