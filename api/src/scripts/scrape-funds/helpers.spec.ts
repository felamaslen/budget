import { removeWhitespace } from './helpers';

describe('removeWhitespace', () => {
  it('removes whitespace', () => {
    expect(removeWhitespace('a\nb\tc\rd e   f   > >>')).toEqual('abcd e f>>>');
  });
});
