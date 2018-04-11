async function down(knex) {
    await knex.schema.dropTableIfExists('fund_cache');
    await knex.schema.dropTableIfExists('fund_cache_time');
    await knex.schema.dropTableIfExists('fund_hash');
    await knex.schema.dropTableIfExists('funds_transactions');
    await knex.schema.dropTableIfExists('funds');
    await knex.schema.dropTableIfExists('stocks');
    await knex.schema.dropTableIfExists('stock_codes');
}

async function up(knex, Promise) {
    await down(knex);

    await Promise.all([
        knex.schema.createTable('funds', table => {
            table.collate('utf8mb4_unicode_ci');

            table.increments('id').unsigned()
                .primary();
            table.integer('uid').unsigned()
                .notNullable()
                .references('users.uid')
                .onDelete('CASCADE');
            table.string('item', 190).notNullable();
            table.unique(['uid', 'item']);
        }),
        knex.schema.createTable('funds_transactions', table => {
            table.increments('id').unsigned()
                .primary();
            table.integer('fundId')
                .unsigned()
                .references('funds.id')
                .onDelete('CASCADE');

            table.date('date').notNullable();
            table.double('units').notNullable();
            table.integer('cost').notNullable();
        }),
        knex.schema.createTable('fund_hash', table => {
            table.collate('utf8_unicode_ci');

            table.increments('fid').unsigned()
                .primary();
            table.string('broker').notNullable();
            table.string('hash').notNullable();
            table.unique(['broker', 'hash']);
        }),
        knex.schema.createTable('fund_cache_time', table => {
            table.collate('utf8_unicode_ci');

            table.increments('cid').unsigned()
                .notNullable();
            table.dateTime('time').index()
                .notNullable();
            table.boolean('done');
        }),
        knex.schema.createTable('fund_cache', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned()
                .primary();
            table.integer('cid').unsigned()
                .references('fund_cache_time.cid')
                .onDelete('CASCADE');

            table.integer('fid').unsigned()
                .references('fund_hash.fid')
                .onDelete('CASCADE');

            table.float('price');
            table.unique(['cid', 'fid']);
        }),
        knex.schema.createTable('stocks', table => {
            table.collate('utf8mb4_unicode_ci');

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
        }),
        knex.schema.createTable('stock_codes', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id')
                .unsigned()
                .primary();
            table.string('name').notNullable();
            table.string('code');
            table.unique(['name', 'code']);
        })
    ]);
}

module.exports = { up, down };

