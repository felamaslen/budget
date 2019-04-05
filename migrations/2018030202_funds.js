function up(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('funds', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

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
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('fid').unsigned()
                .primary();
            table.string('broker').notNullable();
            table.string('hash').notNullable();
            table.unique(['broker', 'hash']);
        }),
        knex.schema.createTable('fund_cache_time', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('cid').unsigned()
                .notNullable();
            table.dateTime('time').index()
                .notNullable();
            table.boolean('done');
        }),
        knex.schema.createTable('fund_cache', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

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
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

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
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id')
                .unsigned()
                .primary();
            table.string('name').notNullable();
            table.string('code');
            table.unique(['name', 'code']);
        })
    ]);
}

module.exports = { up, down: () => null };

