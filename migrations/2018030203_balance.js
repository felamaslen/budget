function up(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('balance', table => {
            if (process.env.NODE_ENV !== 'test') {
                table.collate('utf8mb4_unicode_ci');
            }

            table.increments('id').unsigned()
                .primary();
            table.integer('uid').unsigned()
                .notNullable();
            table.foreign('uid').references('users.uid');
            table.date('date').notNullable();
            table.bigInteger('value').notNullable();

            table.unique(['uid', 'date']);
        })
    ]);
}

module.exports = { up, down: () => null };

