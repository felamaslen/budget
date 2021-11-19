import { render, RenderResult } from '@testing-library/react';
import { rgb } from 'polished';
import { FundGainInfo } from '.';

describe('<FundGainInfo />', () => {
  const props = {
    rowGains: {
      price: 1023,
      value: 561932,
      gain: 0.3,
      gainAbs: 4030,
      dayGain: -0.02,
      dayGainAbs: -341,
      color: rgb(255, 128, 30),
    },
    isSold: false,
  };

  const setup = (extraProps = {}): RenderResult =>
    render(<FundGainInfo {...props} {...extraProps} />);

  it.each`
    thing                        | value
    ${'current value'}           | ${'£5.6k'}
    ${'current price'}           | ${'1023.00p'}
    ${'overall (absolute) gain'} | ${'£40'}
    ${'overall (relative) gain'} | ${'30.00%'}
    ${'daily (absolute) gain'}   | ${'(£3)'}
    ${'daily (relative) gain'}   | ${'(2.00%)'}
  `('should render the $thing', ({ value }) => {
    expect.assertions(1);
    const { getByText } = setup();
    expect(getByText(value)).toBeInTheDocument();
  });

  it('should not render anything if there are no gain info', () => {
    expect.assertions(1);
    const { container } = setup({ rowGains: null });
    expect(container).toMatchInlineSnapshot(`<div />`);
  });

  describe('if the fund is sold', () => {
    const setupSold = (): RenderResult => setup({ isSold: true });

    it('should not render the daily gains', () => {
      expect.assertions(2);
      const { queryByText } = setupSold();
      expect(queryByText('(£3)')).not.toBeInTheDocument();
      expect(queryByText('(£2.00%)')).not.toBeInTheDocument();
    });
  });
});
