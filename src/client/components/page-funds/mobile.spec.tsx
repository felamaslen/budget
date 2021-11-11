import { render, act, fireEvent } from '@testing-library/react';
import { FundNameMobile } from './mobile';

describe('<FundNameMobile />', () => {
  const props = {
    value: 'Monks Investment Trust Ordinary 5p (share)',
  };

  it('should render an abbreviated fund name', () => {
    expect.assertions(1);
    const { getByText } = render(<FundNameMobile {...props} />);
    expect(getByText('MNKS')).toBeInTheDocument();
  });

  describe('when touching', () => {
    it('should render the full name', () => {
      expect.assertions(2);
      const { getByText } = render(
        <FundNameMobile value="The Biotech Growth Trust (BIOG.L) (stock)" />,
      );

      act(() => {
        fireEvent.touchStart(getByText('BIOG'));
      });

      expect(getByText('The Biotech Growth Trust')).toBeInTheDocument();

      act(() => {
        fireEvent.touchEnd(getByText('The Biotech Growth Trust'));
      });

      expect(getByText('BIOG')).toBeInTheDocument();
    });
  });
});
