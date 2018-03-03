/* eslint-disable newline-per-chained-call */

module.exports = {
    up: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('fund_cache'),
        knex.schema.dropTableIfExists('fund_hash'),
        knex.schema.dropTableIfExists('fund_cache_time'),
        knex.schema.dropTableIfExists('funds'),
        knex.schema.dropTableIfExists('stocks'),
        knex.schema.dropTableIfExists('stock_codes')
    ]).then(() => Promise.all([
        knex.schema.createTable('funds', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned().primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable();
            table.text('transactions').notNullable();
            table.integer('cost').notNullable();
            table.unique(['uid', 'item']);
        }),
        knex.schema.createTable('fund_hash', table => {
            table.collate('utf8_unicode_ci');

            table.increments('fid').unsigned().primary();
            table.string('broker').notNullable();
            table.string('hash').notNullable();
            table.unique(['broker', 'hash']);
        }),
        knex.schema.createTable('fund_cache_time', table => {
            table.collate('utf8_unicode_ci');

            table.increments('cid').unsigned().notNullable();
            table.dateTime('time').index().notNullable();
            table.boolean('done');
        }),
        knex.schema.createTable('fund_cache', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned().primary();
            table.integer('cid').unsigned();
            table.foreign('cid').references('fund_cache_time.cid');
            table.integer('fid').unsigned();
            table.foreign('fid').references('fund_hash.fid');
            table.float('price');
            table.unique(['cid', 'fid']);
        }),
        knex.schema.createTable('stocks', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned().primary();
            table.integer('uid').unsigned().notNullable();
            table.foreign('uid').references('users.uid');
            table.string('name').notNullable();
            table.string('code');
            table.float('weight');
            table.float('subweight');
        }),
        knex.schema.createTable('stock_codes', table => {
            table.collate('utf8_unicode_ci');

            table.increments('id').unsigned().primary();
            table.string('name').notNullable();
            table.string('code');
            table.unique(['name', 'code']);
        })
    ])),
    down: (knex, Promise) => Promise.all([
        knex.schema.dropTableIfExists('funds'),
        knex.schema.dropTableIfExists('fund_hash'),
        knex.schema.dropTableIfExists('fund_cache_time'),
        knex.schema.dropTableIfExists('fund_cache'),
        knex.schema.dropTableIfExists('stocks'),
        knex.schema.dropTableIfExists('stock_codes')
    ])
};

