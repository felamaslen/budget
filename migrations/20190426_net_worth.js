async function up(knex) {
    await knex.schema.createTable('net_worth', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.integer('uid').unsigned()
            .notNullable()
            .references('users.uid')
            .onDelete('CASCADE');

        table.date('date').notNullable();
    });

    await knex.schema.createTable('net_worth_categories', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.enu('type', ['asset', 'liability'])
            .notNullable();

        table.string('category', 120);

        table.index(['type', 'category']);

        table.string('color', 100);
    });

    await knex.schema.createTable('net_worth_subcategories', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.integer('category_id')
            .unsigned()
            .notNullable()
            .references('net_worth_categories.id')
            .onDelete('CASCADE');

        table.string('subcategory', 120);

        table.boolean('has_credit_limit');

        table.float('opacity')
            .defaultTo(0);
    });

    await knex.schema.createTable('net_worth_values', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.integer('net_worth_id')
            .unsigned()
            .notNullable()
            .references('net_worth.id')
            .onDelete('CASCADE');

        table.integer('subcategory')
            .unsigned()
            .notNullable()
            .references('net_worth_subcategories.id')
            .onDelete('CASCADE');

        table.integer('value');
    });

    await knex.schema.createTable('net_worth_currencies', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.integer('net_worth_id')
            .unsigned()
            .notNullable()
            .references('net_worth.id')
            .onDelete('CASCADE');

        table.string('currency', 100);

        table.index(['net_worth_id', 'currency']);

        table.double('rate');
    });

    await knex.schema.createTable('net_worth_fx_values', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.increments('id')
            .primary();

        table.integer('values_id')
            .unsigned()
            .notNullable()
            .references('net_worth_values.id')
            .onDelete('CASCADE');

        table.float('value');

        table.string('currency', 100);
    });

    await knex.schema.createTable('net_worth_credit_limit', table => {
        if (process.env.NODE_ENV !== 'test') {
            table.collate('utf8mb4_unicode_ci');
        }

        table.integer('net_worth_id')
            .unsigned()
            .notNullable()
            .references('net_worth.id')
            .onDelete('CASCADE');

        table.integer('subcategory')
            .unsigned()
            .notNullable()
            .references('net_worth_subcategories.id')
            .onDelete('CASCADE');

        table.primary(['net_worth_id', 'subcategory']);

        table.integer('value')
            .unsigned()
            .notNullable();
    });
}

async function down(knex) {
    await knex.schema.dropTable('net_worth_credit_limit');
    await knex.schema.dropTable('net_worth_fx_values');
    await knex.schema.dropTable('net_worth_currencies');
    await knex.schema.dropTable('net_worth_values');
    await knex.schema.dropTable('net_worth_subcategories');
    await knex.schema.dropTable('net_worth_categories');
    await knex.schema.dropTable('net_worth');
}

module.exports = { up, down };
