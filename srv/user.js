/**
 * User methods
 */

const sha1 = require('sha1');

function userPinHash(pin, salt) {
  return sha1(`${pin}${salt}`);
};

module.exports = {
  hash: userPinHash
};

