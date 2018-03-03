/* eslint-disable newline-per-chained-call */

module.exports = {
    up: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('balance')
    ]).then(() => Promise.all([
        knex.schema.createTable('balance', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned().primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable().unique();
            table.bigInteger('balance').notNullable();
        })
    ])),
    down: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('balance')
    ])
};

