import { render } from '@testing-library/react';
import React from 'react';
import ListRowFundsMobile from '~client/components/ListRowFundsMobile';
import { getTransactionsList } from '~client/modules/data';

describe('<ListRowFundsMobile />', () => {
  const item = {
    gain: {
      value: 9931,
    },
    transactions: getTransactionsList([{ date: '2019-06-23', units: 44.31, cost: 1092397 }]),
  };

  it('should render a cost value', async () => {
    expect.assertions(1);
    const { findByText } = render(<ListRowFundsMobile item={item} />);
    const costValue = await findByText('£10.9k');
    expect(costValue).toBeInTheDocument();
  });

  it('should render an actual value', async () => {
    expect.assertions(1);
    const { findByText } = render(<ListRowFundsMobile item={item} />);
    const actualValue = await findByText('£99.31');
    expect(actualValue).toBeInTheDocument();
  });

  it('should render a dash if the fund is sold', async () => {
    expect.assertions(3);
    const { findByText, queryByText } = render(
      <ListRowFundsMobile
        item={{
          ...item,
          transactions: getTransactionsList([
            { date: '2019-06-23', units: 44.31, cost: 1092397 },
            { date: '2019-07-31', units: -44.31, cost: -1131032 },
          ]),
        }}
      />,
    );

    const actualValue = await findByText('\u2013');
    expect(actualValue).toBeInTheDocument();

    expect(queryByText('£10.9k')).not.toBeInTheDocument();
    expect(queryByText('£99.31')).not.toBeInTheDocument();
  });

  describe('if there is no gain', () => {
    it('should render nothing if there is no gain', () => {
      expect.assertions(1);
      const { container } = render(
        <ListRowFundsMobile
          item={{
            transactions: [],
            gain: null,
          }}
        />,
      );

      expect(container.childNodes).toHaveLength(0);
    });
  });
});
