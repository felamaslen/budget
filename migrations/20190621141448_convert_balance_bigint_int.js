const up = knex => knex.schema.alterTable('balance', table => {
    table.integer('value')
        .notNullable()
        .alter();
});

const down = knex => knex.schema.alterTable('balance', table => {
    table.bigInteger('value')
        .notNullable()
        .alter();
});

module.exports = { up, down };
