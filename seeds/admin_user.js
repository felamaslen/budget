const { generateUserPin } = require('../api/src/modules/auth');

async function seed(knex) {
    const { pinRaw, pinHash } = await generateUserPin(process.env.DEFAULT_PIN);

    const [id] = await knex
        .insert({
            name: 'admin',
            'pin_hash': pinHash
        })
        .returning('uid')
        .into('users');

    console.log('Created user', { id, pin: pinRaw });
}

module.exports = { seed };
