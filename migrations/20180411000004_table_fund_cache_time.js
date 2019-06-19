const up = knex => knex.schema.createTable('fund_cache_time', table => {
    table.increments('cid').unsigned()
        .notNullable();
    table.dateTime('time').index()
        .notNullable();
    table.boolean('done');
});

const down = knex => knex.schema.dropTable('fund_cache_time');

module.exports = { up, down };
