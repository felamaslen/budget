const bcrypt = require('bcrypt');

function generateUserPin(defaultPin = null) {
  const pinRaw = defaultPin || String(Math.floor(Math.random() * 8999) + 1000);

  return new Promise((resolve, reject) => {
    bcrypt.hash(pinRaw, 10, (err, pinHash) => {
      if (err) {
        return reject(err);
      }

      return resolve({ pinRaw, pinHash });
    });
  });
}

module.exports = generateUserPin;
