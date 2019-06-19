const up = knex => knex.schema.createTable('fund_cache_time', table => {
    table.uuid('cid')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.dateTime('time').index()
        .notNullable();
    table.boolean('done');
});

const down = knex => knex.schema.dropTable('fund_cache_time');

module.exports = { up, down };
