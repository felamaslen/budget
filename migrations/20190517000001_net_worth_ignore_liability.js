const up = knex => knex.schema.table('net_worth_values', table => {
    table.boolean('skip')
        .defaultTo(null);
});

const down = knex => knex.schema.table('net_worth_values', table => {
    table.dropColumn('skip');
});

module.exports = { up, down };
