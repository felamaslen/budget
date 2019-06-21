const up = knex => knex.schema.createTable('net_worth', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid')
        .notNullable()
        .references('users.uid')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.date('date').notNullable();
});

const down = knex => knex.schema.dropTable('net_worth');

module.exports = { up, down };
