import { removeWhitespace } from './helpers';

describe('removeWhitespace', () => {
  it('removes whitespace', () => {
    expect.assertions(1);
    expect(removeWhitespace('a\nb\tc\rd e   f   > >>')).toBe('abcd e f>>>');
  });
});
