const up = knex => knex.schema.createTable('net_worth_values', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('net_worth_id')
        .notNullable()
        .references('net_worth.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.uuid('subcategory')
        .notNullable()
        .references('net_worth_subcategories.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.integer('value');
});

const down = knex => knex.schema.dropTable('net_worth_values');

module.exports = { up, down };
