const upTable = knex => ({ tableName, full = false, categoryName = 'category' }) =>
    knex.schema.createTable(tableName, table => {
        table.uuid('id')
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));

        table.uuid('uid')
            .notNullable()
            .references('users.uid')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');

        table.date('date').notNullable();
        table.string('item').notNullable();
        table.integer('cost').notNullable();

        if (full) {
            table.string(categoryName)
                .notNullable()
                .index();

            table.string('shop')
                .notNullable()
                .index();
        }
    });

const downTable = knex => ({ tableName }) => knex.schema.dropTable(tableName);

const tableDefinitions = [
    { tableName: 'income' },
    { tableName: 'bills' },
    { tableName: 'food', full: true },
    { tableName: 'general', full: true },
    { tableName: 'social', full: true, categoryName: 'society' },
    { tableName: 'holiday', full: true, categoryName: 'holiday' }
];

const up = knex => Promise.all(tableDefinitions.map(upTable(knex)));

const down = knex => Promise.all(tableDefinitions.map(downTable(knex)));

module.exports = { up, down };
