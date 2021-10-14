import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import numericHash from 'string-hash';

import { animationTime } from './hooks';
import type { Props } from './types';
import { ModalDialog, makeField } from '.';
import { FormFieldText, FormFieldCost, FormFieldDate } from '~client/components/form-field';
import { CREATE_ID } from '~client/constants/data';
import type { Id } from '~client/types';

describe('<ModalDialog />', () => {
  type MyItem = {
    date: Date;
    item: string;
    cost: number;
  };

  const props: Props<MyItem> = {
    active: true,
    loading: false,
    id: numericHash('some-id'),
    item: {
      date: undefined,
      item: 'some item',
      cost: 342,
    },
    fields: {
      date: makeField('date', FormFieldDate),
      item: makeField('item', FormFieldText),
      cost: makeField('cost', FormFieldCost),
    },
    type: 'edit',
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('should hide after a delay', () => {
    expect.assertions(4);
    jest.useFakeTimers();

    const { container } = render(<ModalDialog {...props} />);
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      render(<ModalDialog {...props} active={false} />, { container });
    });
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(animationTime - 1);
    });
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(container.childNodes).toHaveLength(0);
  });

  it('should show from inactive', () => {
    expect.assertions(2);
    const { container } = render(<ModalDialog {...props} active={false} />);
    expect(container.childNodes).toHaveLength(0);

    act(() => {
      render(<ModalDialog {...props} active />, { container });
    });
    expect(container.childNodes).toHaveLength(1);
  });

  it('should render a title', () => {
    expect.assertions(1);
    const { getByText } = render(<ModalDialog {...props} />);
    expect(getByText(`Editing id#${numericHash('some-id')}`)).toBeInTheDocument();
  });

  describe('when adding', () => {
    const propsAdding: Props<MyItem> = { ...props, id: CREATE_ID, type: 'add' };

    it('should render an alternative title', () => {
      expect.assertions(1);
      const { getByText } = render(<ModalDialog {...propsAdding} />);
      expect(getByText('Add item')).toBeInTheDocument();
    });
  });

  it('should render a form list', () => {
    expect.assertions(4);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-04-10T15:23Z'));

    const { getByTestId, getByDisplayValue } = render(<ModalDialog {...props} />);

    const formList = getByTestId('form-list');
    expect(formList).toBeInTheDocument();

    const inputDate = getByDisplayValue('2020-04-10');
    const inputItem = getByDisplayValue('some item');
    const inputNumber = getByDisplayValue('3.42');

    expect(inputDate).toBeInTheDocument();
    expect(inputItem).toBeInTheDocument();
    expect(inputNumber).toBeInTheDocument();
  });

  describe('cancel button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<ModalDialog {...props} />);
      const cancelButton = getByText('nope.avi');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should call the onCancel event when clicked', () => {
      expect.assertions(1);
      const { getByText } = render(<ModalDialog {...props} />);
      const cancelButton = getByText('nope.avi');

      userEvent.click(cancelButton);
      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('submit button', () => {
    it('should be rendered', () => {
      expect.assertions(1);
      const { getByText } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');
      expect(submitButton).toBeInTheDocument();
    });

    it('should call the onSubmit event when clicked', () => {
      expect.assertions(2);
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2020-04-10T15:23Z'));

      const { getByText } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      userEvent.click(submitButton);
      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(props.onSubmit).toHaveBeenCalledWith<[Id, MyItem]>(numericHash('some-id'), {
        date: new Date('2020-04-10'),
        item: 'some item',
        cost: 342,
      });
    });

    it('should submit an edited form', () => {
      expect.assertions(5);

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2020-04-10T15:23Z'));

      const { getByText, getByDisplayValue } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      const inputDate = getByDisplayValue('2020-04-10');
      const inputItem = getByDisplayValue('some item');
      const inputCost = getByDisplayValue('3.42');

      expect(inputDate).toBeInTheDocument();
      expect(inputItem).toBeInTheDocument();
      expect(inputCost).toBeInTheDocument();

      userEvent.clear(inputDate);
      userEvent.type(inputDate, '2020-04-20');
      userEvent.clear(inputItem);
      userEvent.type(inputItem, 'other item');
      userEvent.clear(inputCost);
      userEvent.type(inputCost, '1.08');

      userEvent.click(submitButton);

      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(props.onSubmit).toHaveBeenCalledWith<[Id, MyItem]>(numericHash('some-id'), {
        date: new Date('2020-04-20'),
        item: 'other item',
        cost: 108,
      });
    });

    it('should not submit invalid values', () => {
      expect.assertions(3);
      const { getByText, getByDisplayValue } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      const inputItem = getByDisplayValue('some item');
      const inputCost = getByDisplayValue('3.42');

      expect(inputItem).toBeInTheDocument();
      expect(inputCost).toBeInTheDocument();

      userEvent.clear(inputItem);
      userEvent.click(submitButton);

      expect(props.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('remove button', () => {
    it('should not be rendered if onRemove is not passed', () => {
      expect.assertions(1);
      const { queryByText } = render(<ModalDialog {...props} onRemove={undefined} />);
      const removeButton = queryByText('−');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('should be rendered if onRemove is passed', () => {
      expect.assertions(1);
      const onRemove = jest.fn();
      const { getByText } = render(<ModalDialog {...props} onRemove={onRemove} />);
      const removeButton = getByText('−');
      expect(removeButton).toBeInTheDocument();
    });

    it('should call the onRemove event when clicked', () => {
      expect.assertions(1);
      const onRemove = jest.fn();
      const { getByText } = render(<ModalDialog {...props} onRemove={onRemove} />);
      const removeButton = getByText('−');

      userEvent.click(removeButton);
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('while loading', () => {
    const propsLoading = { ...props, onRemove: jest.fn(), loading: true };

    it('should disable the buttons', () => {
      expect.assertions(3);
      const { getByText } = render(<ModalDialog {...propsLoading} />);

      expect((getByText('nope.avi') as HTMLButtonElement).disabled).toBe(true);
      expect((getByText('Do it.') as HTMLButtonElement).disabled).toBe(true);
      expect((getByText('−') as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
