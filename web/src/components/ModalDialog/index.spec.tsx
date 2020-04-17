import sinon from 'sinon';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

import ModalDialog, { Props, animationTime } from '.';
import { CREATE_ID } from '~client/constants/data';

describe('<ModalDialog />', () => {
  const props: Props = {
    active: true,
    loading: false,
    id: 'some-id',
    fields: [
      { item: 'item', value: 'some item' },
      { item: 'cost', value: 342 },
    ],
    type: 'edit',
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
  };

  it('should hide after a delay', () => {
    const clock = sinon.useFakeTimers();

    const { container } = render(<ModalDialog {...props} />);
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      render(<ModalDialog {...props} active={false} />, { container });
    });
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      clock.tick(animationTime - 1);
    });
    expect(container.childNodes).toHaveLength(1);

    act(() => {
      clock.tick(1);
    });
    expect(container.childNodes).toHaveLength(0);

    clock.restore();
  });

  it('should show from inactive', () => {
    const { container } = render(<ModalDialog {...props} active={false} />);
    expect(container.childNodes).toHaveLength(0);

    act(() => {
      render(<ModalDialog {...props} active />, { container });
    });
    expect(container.childNodes).toHaveLength(1);
  });

  it('should render a title', () => {
    const { getByText } = render(<ModalDialog {...props} />);
    expect(getByText('Editing id#some-id')).toBeInTheDocument();
  });

  describe('when adding', () => {
    const propsAdding: Props = { ...props, id: CREATE_ID, type: 'add' };

    it('should render an alternative title', () => {
      const { getByText } = render(<ModalDialog {...propsAdding} />);
      expect(getByText('Add item')).toBeInTheDocument();
    });
  });

  it('should render a form list', () => {
    const { getByTestId } = render(<ModalDialog {...props} />);
    const formList = getByTestId('form-list');

    expect(formList).toBeInTheDocument();
    expect(formList).toMatchSnapshot();
  });

  describe('cancel button', () => {
    it('should be rendered', () => {
      const { getByText } = render(<ModalDialog {...props} />);
      const cancelButton = getByText('nope.avi');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should call the onCancel event when clicked', () => {
      const { getByText } = render(<ModalDialog {...props} />);
      const cancelButton = getByText('nope.avi');

      act(() => {
        fireEvent.click(cancelButton);
      });
      expect(props.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('submit button', () => {
    it('should be rendered', () => {
      const { getByText } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');
      expect(submitButton).toBeInTheDocument();
    });

    it('should call the onSubmit event when clicked', () => {
      const { getByText } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      act(() => {
        fireEvent.click(submitButton);
      });
      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(props.onSubmit).toHaveBeenCalledWith({
        id: 'some-id',
        item: 'some item',
        cost: 342,
      });
    });

    it('should submit an edited form', () => {
      const { getByText, getByDisplayValue } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      const inputItem = getByDisplayValue('some item');
      const inputCost = getByDisplayValue('3.42');

      expect(inputItem).toBeInTheDocument();
      expect(inputCost).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputItem, { target: { value: 'other item' } });
      });
      act(() => {
        fireEvent.blur(inputItem);
      });
      act(() => {
        fireEvent.change(inputCost, { target: { value: '1.08' } });
      });
      act(() => {
        fireEvent.blur(inputCost);
      });

      act(() => {
        fireEvent.click(submitButton);
      });
      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(props.onSubmit).toHaveBeenCalledWith({
        id: 'some-id',
        item: 'other item',
        cost: 108,
      });
    });

    it('should not submit invalid values', () => {
      const { getByText, getByDisplayValue } = render(<ModalDialog {...props} />);
      const submitButton = getByText('Do it.');

      const inputItem = getByDisplayValue('some item');
      const inputCost = getByDisplayValue('3.42');

      expect(inputItem).toBeInTheDocument();
      expect(inputCost).toBeInTheDocument();

      act(() => {
        fireEvent.change(inputItem, { target: { value: '' } });
      });
      act(() => {
        fireEvent.blur(inputItem);
      });

      act(() => {
        fireEvent.click(submitButton);
      });
      expect(props.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('remove button', () => {
    it('should not be rendered if onRemove is not passed', () => {
      const { queryByText } = render(<ModalDialog {...props} onRemove={undefined} />);
      const removeButton = queryByText('−');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('should be rendered if onRemove is passed', () => {
      const onRemove = jest.fn();
      const { getByText } = render(<ModalDialog {...props} onRemove={onRemove} />);
      const removeButton = getByText('−');
      expect(removeButton).toBeInTheDocument();
    });

    it('should call the onRemove event when clicked', () => {
      const onRemove = jest.fn();
      const { getByText } = render(<ModalDialog {...props} onRemove={onRemove} />);
      const removeButton = getByText('−');

      act(() => {
        fireEvent.click(removeButton);
      });
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('while loading', () => {
    const propsLoading = { ...props, onRemove: jest.fn(), loading: true };

    it('should disable the buttons', () => {
      const { getByText } = render(<ModalDialog {...propsLoading} />);

      expect((getByText('nope.avi') as HTMLButtonElement).disabled).toBe(true);
      expect((getByText('Do it.') as HTMLButtonElement).disabled).toBe(true);
      expect((getByText('−') as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
