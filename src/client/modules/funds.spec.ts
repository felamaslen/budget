import { formatValue } from './funds';
import { FundMode } from '~client/types/enum';

describe('funds module', () => {
  describe(formatValue.name, () => {
    describe.each`
      mode                        | expectedType                      | input      | expectedValue
      ${FundMode.Roi}             | ${'percentage'}                   | ${13.2984} | ${'13.30%'}
      ${FundMode.Value}           | ${'currency value'}               | ${104023}  | ${'£1k'}
      ${FundMode.Stacked}         | ${'currency value'}               | ${104023}  | ${'£1k'}
      ${FundMode.Allocation}      | ${'percentage'}                   | ${0.19667} | ${'19.67%'}
      ${FundMode.Price}           | ${'currency value'}               | ${491}     | ${'£4.91'}
      ${FundMode.Price}           | ${'currency value (abbreviated)'} | ${931239}  | ${'£9.3k'}
      ${FundMode.PriceNormalised} | ${'positive percentage'}          | ${117.348} | ${'17.35%'}
      ${FundMode.PriceNormalised} | ${'negative percentage'}          | ${79.451}  | ${'-20.55%'}
    `('when the mode is $mode', ({ mode, expectedType, input, expectedValue }) => {
      it(`should return a ${expectedType}`, () => {
        expect.assertions(1);
        expect(formatValue(input, mode)).toBe(expectedValue);
      });
    });
  });
});
