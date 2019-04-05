async function up(knex, Promise) {
    await Promise.all([
        knex.schema.createTable('income', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable()
                .references('users.uid')
                .onDelete('CASCADE');

            table.date('date').notNullable();
            table.string('item').notNullable();
            table.integer('cost').notNullable();
        }),
        knex.schema.createTable('bills', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable()
                .references('users.uid')
                .onDelete('CASCADE');

            table.date('date').notNullable();
            table.string('item').notNullable();
            table.integer('cost').notNullable();
        }),
        knex.schema.createTable('food', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable()
                .references('users.uid')
                .onDelete('CASCADE');

            table.date('date').notNullable();
            table.string('item').notNullable()
                .index();
            table.string('category').notNullable()
                .index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable()
                .index();
        }),
        knex.schema.createTable('general', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable()
                .index();
            table.string('category').notNullable()
                .index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable()
                .index();
        }),
        knex.schema.createTable('social', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.string('item').notNullable()
                .index();
            table.string('society').notNullable()
                .index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable()
                .index();
        }),
        knex.schema.createTable('holiday', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').primary();
            table.integer('uid').unsigned()
                .notNullable()
                .references('users.uid')
                .onDelete('CASCADE');

            table.date('date').notNullable();
            table.string('item').notNullable()
                .index();
            table.string('holiday').notNullable()
                .index();
            table.integer('cost').notNullable();
            table.string('shop').notNullable()
                .index();
        })
    ]);
}

module.exports = { up, down: () => null };

