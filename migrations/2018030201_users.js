const { generateUserPin } = require('../api/src/modules/auth');

async function up(knex, Promise) {
    await Promise.all([
        knex.schema.createTable('users', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('uid').unsigned()
                .primary();
            table.string('name').notNullable();
            table.string('pinHash').unique()
                .notNullable()
                .collate('utf8_unicode_ci');
        }),
        knex.schema.createTable('ip_login_req', table => {
            table.collate('utf8mb4_unicode_ci');

            table.string('ip').primary()
                .collate('utf8_unicode_ci');
            table.timestamp('time').notNullable();
            table.integer('count').notNullable()
                .defaultTo(0);
        })
    ]);

    const { pinRaw, pinHash } = await generateUserPin();

    console.log('Creating user with PIN:', pinRaw);

    await knex.insert({ name: 'admin', pinHash }).into('users');
}

module.exports = { up, down: () => null };

