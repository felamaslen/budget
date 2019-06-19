const up = knex => knex.schema.createTable('stocks', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('uid')
        .notNullable()
        .references('users.uid')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.string('name').notNullable();
    table.string('code');
    table.float('weight');
    table.float('subweight');
});

const down = knex => knex.schema.dropTable('stocks');

module.exports = { up, down };
