const up = knex => knex.schema.createTable('net_worth_subcategories', table => {
    table.uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('category_id')
        .notNullable()
        .references('net_worth_categories.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

    table.string('subcategory');

    table.boolean('has_credit_limit');

    table.float('opacity')
        .defaultTo(0);
});

const down = knex => knex.schema.dropTable('net_worth_subcategories');

module.exports = { up, down };
