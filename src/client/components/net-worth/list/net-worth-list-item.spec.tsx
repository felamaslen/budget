import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import numericHash from 'string-hash';

import { NetWorthListItem, Props } from './net-worth-list-item';

describe('net worth list item form wrapper', () => {
  const props: Props = {
    item: {
      id: numericHash('my-id'),
      date: new Date('2020-04-20'),
      currencies: [],
      values: [],
      creditLimit: [],
    },
    categories: [],
    subcategories: [],
    active: true,
    setActive: jest.fn(),
    noneActive: false,
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  describe('when deleting the entry', () => {
    it('should ask the user to confirm', () => {
      expect.assertions(3);
      const { getByText } = render(<NetWorthListItem {...props} />);
      userEvent.click(getByText('Delete'));

      expect(props.onDelete).not.toHaveBeenCalled();

      expect(getByText('Confirm')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onDelete after pressing confirm', () => {
      expect.assertions(1);
      const { getByText } = render(<NetWorthListItem {...props} />);
      userEvent.click(getByText('Delete'));
      userEvent.click(getByText('Confirm'));

      expect(props.onDelete).toHaveBeenCalledTimes(1);
    });

    it('should not call onDelete when pressing cancel', () => {
      expect.assertions(3);
      const { getByText, queryByText } = render(<NetWorthListItem {...props} />);
      userEvent.click(getByText('Delete'));
      userEvent.click(getByText('Cancel'));

      expect(queryByText('Confirm')).not.toBeInTheDocument();
      expect(queryByText('Cancel')).not.toBeInTheDocument();

      expect(props.onDelete).not.toHaveBeenCalled();
    });
  });
});
