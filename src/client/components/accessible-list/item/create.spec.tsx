import { render, RenderResult, act, fireEvent } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { standardFields } from '../standard';
import type { PropsItemCreate } from '../types';

import { AccessibleListCreateItem } from './create';

import { GQLProviderMock } from '~client/test-utils/gql-provider-mock';
import { PageListStandard } from '~client/types/enum';
import type { ListItemInput } from '~client/types/gql';

describe('Accessible list create form', () => {
  let clock: sinon.SinonFakeTimers;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      clock.runAll();
    });
    clock.restore();
  });

  const page = PageListStandard.Income as const;

  const onCreate = jest.fn();

  const props: PropsItemCreate<ListItemInput, typeof page> = {
    page,
    fields: standardFields,
    onCreate,
  };

  const setup = (): RenderResult =>
    render(
      <GQLProviderMock>
        <AccessibleListCreateItem {...props} />
      </GQLProviderMock>,
    );

  const enterItem = (
    renderResult: RenderResult,
    date: string,
    item: string,
    category: string,
    cost: string,
    shop: string,
  ): void => {
    const inputs = renderResult.getAllByRole('textbox', { hidden: true }) as HTMLInputElement[];
    const addButton = renderResult.getByText('Add');
    const [inputDate, inputItem, inputCategory, inputCost, inputShop] = inputs;

    act(() => {
      fireEvent.focus(inputDate);
      clock.runAll();
    });
    act(() => {
      fireEvent.change(inputDate, { target: { value: date } });
    });
    act(() => {
      fireEvent.blur(inputDate);
    });

    act(() => {
      fireEvent.focus(inputItem);
      clock.runAll();
    });
    act(() => {
      fireEvent.change(inputItem, { target: { value: item } });
    });
    act(() => {
      fireEvent.blur(inputItem);
    });

    act(() => {
      fireEvent.focus(inputCategory);
      clock.runAll();
    });
    act(() => {
      fireEvent.change(inputCategory, { target: { value: category } });
    });
    act(() => {
      fireEvent.blur(inputCategory);
    });

    act(() => {
      fireEvent.focus(inputCost);
      clock.runAll();
    });
    act(() => {
      fireEvent.change(inputCost, { target: { value: cost } });
    });
    act(() => {
      fireEvent.blur(inputCost);
    });

    act(() => {
      fireEvent.focus(inputShop);
      clock.runAll();
    });
    act(() => {
      fireEvent.change(inputShop, { target: { value: shop } });
    });
    act(() => {
      fireEvent.blur(inputShop);
    });

    act(() => {
      fireEvent.click(addButton);
    });
  };

  const firstDateExternal = '1/3/20';
  const secondDateExternal = '2/3/20';

  const firstDateInternal = new Date('2020-03-01');
  const secondDateInternal = new Date('2020-03-02');

  const firstItem = 'first item';
  const secondItem = 'second item';

  const firstCategory = 'first category';
  const secondCategory = 'second category';

  const firstCostExternal = '4.6';
  const secondCostExternal = '7.58';

  const firstCostInternal = 460;
  const secondCostInternal = 758;

  const firstShop = 'first shop';
  const secondShop = 'second shop';

  it.each`
    fieldToKeepSame
    ${'date'}
    ${'item'}
    ${'category'}
    ${'cost'}
    ${'shop'}
  `('should be able to create the same $fieldToKeepSame twice', ({ fieldToKeepSame }) => {
    expect.assertions(4);

    const renderResult = setup();

    enterItem(
      renderResult,
      firstDateExternal,
      firstItem,
      firstCategory,
      firstCostExternal,
      firstShop,
    );

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({
      date: firstDateInternal,
      item: firstItem,
      category: firstCategory,
      cost: firstCostInternal,
      shop: firstShop,
    });

    const nextDateExternal = fieldToKeepSame === 'date' ? firstDateExternal : secondDateExternal;
    const nextDateInternal = fieldToKeepSame === 'date' ? firstDateInternal : secondDateInternal;
    const nextItem = fieldToKeepSame === 'item' ? firstItem : secondItem;
    const nextCategory = fieldToKeepSame === 'category' ? firstCategory : secondCategory;
    const nextCostExternal = fieldToKeepSame === 'cost' ? firstCostExternal : secondCostExternal;
    const nextCostInternal = fieldToKeepSame === 'cost' ? firstCostInternal : secondCostInternal;
    const nextShop = fieldToKeepSame === 'shop' ? firstShop : secondShop;

    onCreate.mockClear();

    enterItem(renderResult, nextDateExternal, nextItem, nextCategory, nextCostExternal, nextShop);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({
      date: nextDateInternal,
      item: nextItem,
      category: nextCategory,
      cost: nextCostInternal,
      shop: nextShop,
    });
  });
});
