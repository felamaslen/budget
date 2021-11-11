import { render, RenderResult } from '@testing-library/react';
import HoverCost from '.';

describe('<HoverCost />', () => {
  const props = {
    value: 123456.78,
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<HoverCost {...props} {...customProps} />);

  describe.each`
    type        | value
    ${'string'} | ${'foo'}
  `('when rendering a $type value', ({ value }) => {
    it('should render its value unmodified', () => {
      expect.assertions(1);
      const { getByText } = getContainer({
        value,
      });

      expect(getByText(value)).toBeInTheDocument();
    });
  });

  describe('when rendering a currency value', () => {
    it('should render an abbreviated value', () => {
      expect.assertions(1);
      const { getByText } = getContainer();
      expect(getByText('£1.2k')).toBeInTheDocument();
    });
  });
});
