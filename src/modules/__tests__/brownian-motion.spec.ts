import sinon from 'sinon';

import { randnBm } from '~/modules/brownian-motion';

test('randnBm returns a Gaussian-incremented value from two random numbers', () => {
  let randomIndex = 0;
  const testRandoms = [0.36123, 0.96951];
  // eslint-disable-next-line no-plusplus
  const stub = sinon.stub(Math, 'random').callsFake(() => testRandoms[randomIndex++ % 2]);

  expect(randnBm()).toBe(Math.sqrt(-2 * Math.log(0.36123)) * Math.cos(2 * Math.PI * 0.96951));

  stub.restore();
});
