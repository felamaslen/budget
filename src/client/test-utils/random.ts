const testRandoms = [0.36123, 0.96951];
export const mockRandom = (randoms: number[] = testRandoms): void => {
  let randomIndex = -1;
  jest.spyOn(global.Math, 'random').mockImplementation(() => {
    randomIndex += 1;
    return randoms[randomIndex % testRandoms.length];
  });
};
