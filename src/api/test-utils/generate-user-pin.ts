import bcrypt from 'bcrypt';

export function generateUserPin(pin = Math.floor(Math.random()) * 8999 + 1000): Promise<{
  pinRaw: string;
  pinHash: string;
}> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(String(pin), 10, (err, pinHash) => {
      if (err) {
        return reject(err);
      }

      return resolve({ pinRaw: String(pin), pinHash });
    });
  });
}
