import * as bcrypt from 'bcrypt';

export interface userPin {
  raw: string;
  hash: string;
}

export function generateUserPin(defaultPin?: string): Promise<userPin> {
  const charUniqueEnough = (chars: number[], nextChar: number): boolean =>
    chars.filter(item => item === nextChar).length <= 1;

  const raw =
    defaultPin ||
    new Array(4)
      .fill(0)
      .reduce((chars: number[]) => {
        let nextChar = null;
        do {
          nextChar = 1 + Math.floor(Math.random() * 9);
        } while (!charUniqueEnough(chars, nextChar));

        return [...chars, nextChar];
      }, [])
      .join('');

  return new Promise((resolve, reject) => {
    bcrypt.hash(raw, 10, (err: Error, hash: string) => {
      if (err) {
        return reject(err);
      }

      return resolve({ raw, hash });
    });
  });
}

exports.seed = () => null;
