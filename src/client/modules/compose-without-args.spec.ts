import { composeWithoutArgs } from './compose-without-args';

describe('composeWithoutArgs', () => {
  it('should run all of the given functions in turn, without arguments', () => {
    expect.assertions(6);

    const f = jest.fn();
    const g = jest.fn();
    const h = jest.fn();

    const fgh = composeWithoutArgs(f, g, h);

    fgh();

    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith();

    expect(g).toHaveBeenCalledTimes(1);
    expect(g).toHaveBeenCalledWith();

    expect(h).toHaveBeenCalledTimes(1);
    expect(h).toHaveBeenCalledWith();
  });
});
