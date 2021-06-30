import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import numericHash from 'string-hash';

import { Step } from './constants';
import { FormContainer, Props } from './form-container';

describe('(net worth edit form) <FormContainer />', () => {
  const props: Props = {
    add: false,
    step: Step.Date,
    id: numericHash('some-fake-id'),
    item: {
      date: new Date('2020-04-20'),
      values: [],
      creditLimit: [],
      currencies: [],
    },
    onDone: jest.fn(),
  };

  describe('done button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const doneButton = getByText('Done');
      expect(doneButton).toBeInTheDocument();
    });
    it('should call onDone when clicked', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const prevButton = getByText('Done');
      act(() => {
        fireEvent.click(prevButton);
      });
      expect(props.onDone).toHaveBeenCalledTimes(1);
    });
  });
});
