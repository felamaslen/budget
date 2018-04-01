/* eslint-disable newline-per-chained-call */

const { generateUserPin } = require('../api/src/modules/auth');

module.exports = {
    up: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('users'),
        knex.schema.dropTableIfExists('ip_login_req')
    ])
        .then(() => Promise.all([
            knex.schema.createTable('users', table => {
                table.collate('utf8mb4_unicode_ci');

                table.increments('uid').unsigned().primary();
                table.string('name').notNullable();
                table.string('pinHash').unique().notNullable()
                    .collate('utf8_unicode_ci');
            }),
            knex.schema.createTable('ip_login_req', table => {
                table.collate('utf8mb4_unicode_ci');

                table.string('ip').primary()
                    .collate('utf8_unicode_ci');
                table.timestamp('time').notNullable();
                table.integer('count').notNullable().defaultTo(0);
            })
        ]))
        .then(generateUserPin)
        .then(({ pinRaw, pinHash }) => {
            console.log('Creating user with PIN:', pinRaw);

            return knex.insert({ name: 'admin', pinHash })
                .into('users');
        }),
    down: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('users'),
        knex.schema.dropTableIfExists('ip_login_req')
    ])
};

