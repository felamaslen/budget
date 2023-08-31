import { render } from '@testing-library/react';
import { getUnixTime, subMonths } from 'date-fns';

import { Props, Retirement } from './retirement';

describe('<Retirement />', () => {
  const props: Props = {
    ftiSeries: [
      [getUnixTime(subMonths(new Date(), 6)), 13],
      [getUnixTime(subMonths(new Date(), 5)), 17],
      [getUnixTime(subMonths(new Date(), 4)), 16.4],
      [getUnixTime(subMonths(new Date(), 3)), 21],
      [getUnixTime(subMonths(new Date(), 2)), 27],
      [getUnixTime(subMonths(new Date(), 1)), 29],
      [getUnixTime(subMonths(new Date(), 0)), 32],
    ],
  };

  // exponential regression:
  // slope = 1.82961;
  // intercept = 3.51009;

  // yearsRequired = Math.ceil((Math.log(1000) - intercept) / slope) ~ 1.857

  it('should return the number of years required to retire', () => {
    expect.assertions(1);
    const { getByText } = render(<Retirement {...props} />);
    expect(getByText('Retire in two years')).toBeInTheDocument();
  });

  it('should say never retire if the slope is negative', () => {
    expect.assertions(1);
    const { getByText } = render(
      <Retirement
        ftiSeries={[
          [getUnixTime(subMonths(new Date(), 6)), 13],
          [getUnixTime(subMonths(new Date(), 5)), 17],
          [getUnixTime(subMonths(new Date(), 4)), 16.4],
          [getUnixTime(subMonths(new Date(), 3)), 9],
          [getUnixTime(subMonths(new Date(), 2)), 12],
          [getUnixTime(subMonths(new Date(), 1)), 11],
          [getUnixTime(subMonths(new Date(), 0)), 5],
        ]}
      />,
    );
    expect(getByText('Never retire!')).toBeInTheDocument();
  });
});
