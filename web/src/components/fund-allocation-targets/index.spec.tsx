import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { FundAllocationTargets, Props } from '.';

describe('<FundAllocationTargets />', () => {
  const props: Props = {
    funds: [
      {
        id: 1,
        item: 'Fund A',
        allocationTarget: 0.3,
        transactions: [],
      },
      {
        id: 2,
        item: 'Fund B',
        allocationTarget: 0.4,
        transactions: [],
      },
    ],
    portfolio: [
      {
        id: 1,
        item: 'Fund A',
        value: 150000,
        allocationTarget: 0.3,
      },
      {
        id: 2,
        item: 'Fund B',
        value: 200000,
        allocationTarget: 0.4,
      },
    ],
    cashTarget: 100000,
    cashToInvest: 130000,
    onSetCashTarget: jest.fn(),
    onSetFundTargets: jest.fn(),
  };

  it('should render each stock', () => {
    expect.assertions(3);
    const { getByText } = render(<FundAllocationTargets {...props} />);
    expect(getByText('Cash')).toBeInTheDocument();
    expect(getByText('Fnd A')).toBeInTheDocument();
    expect(getByText('Fnd B')).toBeInTheDocument();
  });

  describe('when adjusting the cash target', () => {
    it('should show a preview of the current value', async () => {
      expect.hasAssertions();
      const { getByTestId, getByText } = render(<FundAllocationTargets {...props} />);
      const cashTarget = getByTestId('target-cash');
      act(() => {
        fireEvent.mouseDown(cashTarget, { clientX: 104 });
      });

      await waitFor(() => {
        expect(getByText(/^Cash target: /)).toBeInTheDocument();
      });
    });
  });
});
