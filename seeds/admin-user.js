const generateUserPin = require('../api/generate-user-pin');

async function seed(db) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const { pinRaw, pinHash } = await generateUserPin();

  const [id] = await db('users')
    .insert({
      name: 'admin',
      pin_hash: pinHash,
    })
    .returning('uid');

  console.log('Created admin user', { id, pin: pinRaw });
}

module.exports = { seed };
