const up = knex => knex.schema.createTable('users', table => {
    table.uuid('uid')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('name').notNullable();
    table.string('pin_hash').unique()
        .notNullable();
});

const down = knex => knex.schema.dropTable('users');

module.exports = { up, down };
