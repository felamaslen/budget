/* eslint-disable newline-per-chained-call */

module.exports = {
    up: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('income'),
        knex.schema.dropTableIfExists('bills'),
        knex.schema.dropTableIfExists('food'),
        knex.schema.dropTableIfExists('general'),
        knex.schema.dropTableIfExists('social'),
        knex.schema.dropTableIfExists('holiday')
    ]).then(() => Promise.all([
        knex.schema.createTable('income', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable();
            table.integer('cost').notNullable();
        }),
        knex.schema.createTable('bills', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable();
            table.integer('cost').notNullable();
        }),
        knex.schema.createTable('food', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable().index();
            table.string('category').notNullable().index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable().index();
        }),
        knex.schema.createTable('general', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable().index();
            table.string('category').notNullable().index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable().index();
        }),
        knex.schema.createTable('social', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable().index();
            table.string('society').notNullable().index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable().index();
        }),
        knex.schema.createTable('holiday', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable().index();
            table.string('holiday').notNullable().index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable().index();
        })
    ])),
    down: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('income'),
        knex.schema.dropTableIfExists('bills'),
        knex.schema.dropTableIfExists('food'),
        knex.schema.dropTableIfExists('general'),
        knex.schema.dropTableIfExists('social'),
        knex.schema.dropTableIfExists('holiday')
    ])
};

