import { render, act, fireEvent, RenderResult } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ListCreateDesktop from '.';
import CrudList from '~client/components/CrudList';
import { Page } from '~client/types/app';
import { CREATE_ID } from '~client/constants/data';
import state from '~client/test-data/state';

describe('<ListCreateDesktop />', () => {
  const now = new Date('2020-04-20');
  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers(now);
  });
  afterEach(() => {
    clock.restore();
  });

  const page = Page.food;

  const CrudItem: React.FC = () => <span />;

  const props = {
    items: [],
    nav: true,
    Item: CrudItem,
    extraProps: { page },
    CreateItem: ListCreateDesktop,
    onCreate: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
  };

  const mockStore = configureStore();
  const getContainer = (): RenderResult => {
    return render(
      <Provider store={mockStore(state)}>
        <CrudList {...props} />
      </Provider>,
    );
  };

  it('should render an input for each value', () => {
    expect.assertions(3);

    const { getByTestId, getAllByTestId } = getContainer();

    const dateField = getByTestId('form-field-date');
    const textFields = getAllByTestId('form-field-text');
    const costField = getByTestId('form-field-cost');

    expect(dateField).toBeInTheDocument();
    expect(costField).toBeInTheDocument();

    expect(textFields).toHaveLength(3); // item, category, shop
  });

  it('should render an add button', async () => {
    expect.assertions(1);
    const { findByLabelText } = getContainer();

    const addButton = await findByLabelText('add-button');
    expect(addButton).toBeInTheDocument();
  });

  it('should add a value', () => {
    expect.assertions(7);

    const { getByLabelText } = getContainer();

    const addButton = getByLabelText('add-button');

    const next = (): void =>
      act(() => {
        fireEvent.keyDown(window, { key: 'Tab' });
      });

    next();
    const dateInput = getByLabelText(`date-input-${CREATE_ID}`);
    expect(dateInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(dateInput, { target: { value: '24' } });
    });

    next();
    const itemInput = getByLabelText(`item-input-${CREATE_ID}`);
    expect(itemInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(itemInput, { target: { value: 'some item' } });
    });

    next();
    const categoryInput = getByLabelText(`category-input-${CREATE_ID}`);
    expect(categoryInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(categoryInput, { target: { value: 'some category' } });
    });

    next();
    const costInput = getByLabelText(`cost-input-${CREATE_ID}`);
    expect(costInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(costInput, { target: { value: '36.52' } });
    });

    next();
    const shopInput = getByLabelText(`shop-input-${CREATE_ID}`);
    expect(shopInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(shopInput, { target: { value: 'some shop' } });
    });

    next();
    act(() => {
      fireEvent.click(addButton);
    });

    expect(props.onCreate).toHaveBeenCalledTimes(1);
    expect(props.onCreate).toHaveBeenCalledWith(page, {
      id: CREATE_ID,
      date: new Date('2020-04-24'),
      item: 'some item',
      category: 'some category',
      cost: 3652,
      shop: 'some shop',
    });
  });

  it('should not call onAdd if fields are missing', () => {
    expect.assertions(2);

    const { getByLabelText } = getContainer();

    const addButton = getByLabelText('add-button');

    const next = (): void =>
      act(() => {
        fireEvent.keyDown(window, { key: 'Tab' });
      });

    next();
    next();
    const itemInput = getByLabelText(`item-input-${CREATE_ID}`);
    expect(itemInput).toBeInTheDocument();
    act(() => {
      fireEvent.change(itemInput, { target: { value: 'some item' } });
    });

    act(() => {
      fireEvent.click(addButton);
    });

    expect(props.onCreate).not.toHaveBeenCalled();
  });
});
