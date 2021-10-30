import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ConfirmModal, Props } from './confirm-modal';

describe('confirm modal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  const props: Props = {
    onConfirm,
    onCancel,
    title: 'Do you want to do XYZ?',
  };

  it('should render the title', () => {
    expect.assertions(1);
    const { getByText } = render(<ConfirmModal {...props} />);
    expect(getByText('Do you want to do XYZ?')).toBeInTheDocument();
  });

  describe('when pressing confirm', () => {
    it('should call onConfirm', () => {
      expect.assertions(2);
      const { getByText } = render(<ConfirmModal {...props} />);
      userEvent.click(getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('when pressing cancel', () => {
    it('should call onCancel', () => {
      expect.assertions(2);
      const { getByText } = render(<ConfirmModal {...props} />);
      userEvent.click(getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
