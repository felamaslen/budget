const up = knex => knex.schema.createTable('funds', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid')
        .notNullable()
        .references('users.uid')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.string('item').notNullable();
    table.unique(['uid', 'item']);
});

const down = knex => knex.schema.dropTable('funds');

module.exports = { up, down };
