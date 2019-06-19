const up = knex => knex.schema.createTable('fund_cache', table => {
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
});

const down = knex => knex.schema.dropTable('fund_cache');

module.exports = { up, down };
