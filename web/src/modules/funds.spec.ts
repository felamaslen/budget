import { formatValue } from './funds';
import { Mode } from '~client/constants/graph';

describe('funds module', () => {
  describe(formatValue.name, () => {
    describe.each`
      mode                    | expectedType                      | input      | expectedValue
      ${Mode.ROI}             | ${'percentage'}                   | ${13.2984} | ${'13.30%'}
      ${Mode.Value}           | ${'currency value'}               | ${104023}  | ${'£1k'}
      ${Mode.Price}           | ${'currency value'}               | ${491}     | ${'£4.91'}
      ${Mode.Price}           | ${'currency value (abbreviated)'} | ${931239}  | ${'£9.3k'}
      ${Mode.PriceNormalised} | ${'positive percentage'}          | ${117.348} | ${'17.35%'}
      ${Mode.PriceNormalised} | ${'negative percentage'}          | ${79.451}  | ${'-20.55%'}
    `('when the mode is $mode', ({ mode, expectedType, input, expectedValue }) => {
      it(`should return a ${expectedType}`, () => {
        expect.assertions(1);
        expect(formatValue(input, mode)).toBe(expectedValue);
      });
    });
  });
});
