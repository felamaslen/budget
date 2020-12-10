import { formatValue } from './funds';
import { Mode } from '~client/constants/graph';

describe('funds module', () => {
  describe(formatValue.name, () => {
    it('should return a percentage if the mode is ROI', () => {
      expect.assertions(1);
      expect(formatValue(13.2984, Mode.ROI)).toBe('13.30%');
    });

    it('should return a currency value if the mode is not ROI', () => {
      expect.assertions(2);
      expect(formatValue(931239, Mode.Value)).toBe('£9.3k');
      expect(formatValue(491, Mode.Price)).toBe('£4.91');
    });
  });
});
