const up = knex => knex.schema.createTable('funds_transactions', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('fund_id')
        .unsigned()
        .references('funds.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.date('date').notNullable();
    table.double('units').notNullable();
    table.integer('cost').notNullable();
});

const down = knex => knex.schema.dropTable('funds_transactions');

module.exports = { up, down };
