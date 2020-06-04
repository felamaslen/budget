import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import { Step } from './constants';
import { FormContainer, Props } from './form-container';

describe('(net worth edit form) <FormContainer />', () => {
  const props: Props = {
    add: false,
    step: Step.Date,
    item: {
      id: 'some-fake-id',
      date: new Date('2020-04-20'),
      values: [],
      creditLimit: [],
      currencies: [],
    },
    onComplete: jest.fn(),
    onPrevStep: jest.fn(),
    onNextStep: jest.fn(),
    onFirstStep: false,
    onLastStep: false,
  };

  describe('cancel button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const cancelButton = getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });
    it('should call onComplete when clicked', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const cancelButton = getByText('Cancel');
      act(() => {
        fireEvent.click(cancelButton);
      });
      expect(props.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('previous button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const prevButton = getByText('Previous');
      expect(prevButton).toBeInTheDocument();
    });
    it('should call onPrevStep when clicked', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const prevButton = getByText('Previous');
      act(() => {
        fireEvent.click(prevButton);
      });
      expect(props.onPrevStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('next button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const nextButton = getByText('Next');
      expect(nextButton).toBeInTheDocument();
    });
    it('should call onPrevStep when clicked', () => {
      expect.assertions(1);
      const { getByText } = render(<FormContainer {...props} />);
      const nextButton = getByText('Next');
      act(() => {
        fireEvent.click(nextButton);
      });
      expect(props.onNextStep).toHaveBeenCalledTimes(1);
    });
  });
});
