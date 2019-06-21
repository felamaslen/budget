const up = knex => knex.schema.createTable('net_worth_currencies', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('net_worth_id')
        .notNullable()
        .references('net_worth.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.string('currency');

    table.index(['net_worth_id', 'currency']);

    table.double('rate');
});

const down = knex => knex.schema.dropTable('net_worth_currencies');

module.exports = { up, down };
