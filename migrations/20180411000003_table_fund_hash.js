const up = knex => knex.schema.createTable('fund_hash', table => {
    table.uuid('fid')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('broker').notNullable();
    table.string('hash').notNullable();
    table.unique(['broker', 'hash']);
});

const down = knex => knex.schema.dropTable('fund_hash');

module.exports = { up, down };
