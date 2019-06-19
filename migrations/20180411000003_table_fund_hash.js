const up = knex => knex.schema.createTable('fund_hash', table => {
    table.increments('fid').unsigned()
        .primary();
    table.string('broker').notNullable();
    table.string('hash').notNullable();
    table.unique(['broker', 'hash']);
});

const down = knex => knex.schema.dropTable('fund_hash');

module.exports = { up, down };
