import { render, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import numericHash from 'string-hash';

import { NetWorthSubcategoryList, Props } from './index';
import { NetWorthCategoryType } from '~client/types/enum';

describe('netWorthSubcategoryList', () => {
  const onCreate = jest.fn();
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  const props: Props = {
    parent: {
      id: numericHash('my-category'),
      type: NetWorthCategoryType.Asset,
      category: 'Cash',
      color: 'green',
      isOption: false,
    },
    subcategories: [
      {
        id: numericHash('my-existing-subcategory'),
        categoryId: numericHash('my-category'),
        subcategory: 'Bank account',
        hasCreditLimit: null,
        isSAYE: null,
        opacity: 0.9,
      },
    ],
    onCreate,
    onUpdate,
    onDelete,
  };

  describe('when editing an existing subcategory', () => {
    it('should call onUpdate with the new data', async () => {
      expect.assertions(2);

      const { getByDisplayValue, getByText } = render(<NetWorthSubcategoryList {...props} />);

      const inputSubcategory = getByDisplayValue('Bank account') as HTMLInputElement;
      const inputOpacity = getByDisplayValue('0.9') as HTMLInputElement;

      const buttonUpdate = getByText('Update') as HTMLButtonElement;

      userEvent.clear(inputSubcategory);
      userEvent.clear(inputSubcategory);
      userEvent.type(inputSubcategory, 'Different bank account');

      fireEvent.change(inputOpacity, { target: { value: '0.75' } });

      userEvent.click(buttonUpdate);

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledWith(numericHash('my-existing-subcategory'), {
        categoryId: numericHash('my-category'),
        subcategory: 'Different bank account',
        hasCreditLimit: null,
        appreciationRate: null,
        isSAYE: null,
        opacity: 0.75,
      });
    });

    describe('when the category is a non-option asset', () => {
      const propsAsset: Props = {
        ...props,
        parent: {
          ...props.parent,
          type: NetWorthCategoryType.Asset,
          isOption: null,
          category: 'Property portfolio',
        },
        subcategories: [
          {
            ...props.subcategories[0],
            subcategory: 'My house',
          },
        ],
      };

      it('should have an option to add an appreciation rate', () => {
        expect.assertions(7);

        const { getByTestId } = render(<NetWorthSubcategoryList {...propsAsset} />);
        const { getByRole, getByText } = within(getByTestId('subcategory-item-My house'));

        const inputIsIlliquid = getByRole('checkbox') as HTMLInputElement;
        const buttonUpdate = getByText('Update') as HTMLButtonElement;

        expect(inputIsIlliquid).toBeInTheDocument();
        expect(buttonUpdate).toBeInTheDocument();
        expect(inputIsIlliquid.checked).toBe(false);

        userEvent.click(inputIsIlliquid);

        const inputAppreciationRate = getByRole('spinbutton') as HTMLInputElement;

        expect(inputAppreciationRate).toBeInTheDocument();
        expect(inputAppreciationRate.value).toBe('0');

        userEvent.clear(inputAppreciationRate);
        userEvent.type(inputAppreciationRate, '3.8');

        userEvent.click(buttonUpdate);

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(
          numericHash('my-existing-subcategory'),
          expect.objectContaining({
            categoryId: numericHash('my-category'),
            subcategory: 'My house',
            appreciationRate: 3.8,
          }),
        );
      });
    });

    describe('when the category is a liability', () => {
      const propsLiability: Props = {
        ...props,
        parent: {
          ...props.parent,
          type: NetWorthCategoryType.Liability,
          category: 'CC',
        },
        subcategories: [
          {
            ...props.subcategories[0],
            subcategory: 'My credit card',
          },
        ],
      };

      it('should set a credit limit', async () => {
        expect.assertions(4);

        const { getByTestId } = render(<NetWorthSubcategoryList {...propsLiability} />);
        const { getByRole, getByText } = within(getByTestId('subcategory-item-My credit card'));

        const inputHasCreditLimit = getByRole('checkbox') as HTMLInputElement;
        const buttonUpdate = getByText('Update') as HTMLButtonElement;

        expect(inputHasCreditLimit).toBeInTheDocument();
        expect(buttonUpdate).toBeInTheDocument();

        userEvent.click(inputHasCreditLimit);
        userEvent.click(buttonUpdate);

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(
          numericHash('my-existing-subcategory'),
          expect.objectContaining({
            categoryId: numericHash('my-category'),
            subcategory: 'My credit card',
            hasCreditLimit: true,
          }),
        );
      });
    });

    describe('when the category is an option', () => {
      const propsLiability: Props = {
        ...props,
        parent: {
          ...props.parent,
          type: NetWorthCategoryType.Asset,
          category: 'Options',
          isOption: true,
        },
        subcategories: [
          {
            ...props.subcategories[0],
            subcategory: 'My options',
          },
        ],
      };

      it('should set a SAYE toggle', async () => {
        expect.assertions(4);

        const { getByTestId } = render(<NetWorthSubcategoryList {...propsLiability} />);
        const { getByRole, getByText } = within(getByTestId('subcategory-item-My options'));

        const inputIsSAYE = getByRole('checkbox') as HTMLInputElement;
        const buttonUpdate = getByText('Update') as HTMLButtonElement;

        expect(inputIsSAYE).toBeInTheDocument();
        expect(buttonUpdate).toBeInTheDocument();

        userEvent.click(inputIsSAYE);
        userEvent.click(buttonUpdate);

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate).toHaveBeenCalledWith(
          numericHash('my-existing-subcategory'),
          expect.objectContaining({
            categoryId: numericHash('my-category'),
            subcategory: 'My options',
            isSAYE: true,
          }),
        );
      });
    });
  });

  describe('when creating a new subcategory', () => {
    it('should call onCreate with the new data', async () => {
      expect.assertions(2);

      const { getByTestId } = render(<NetWorthSubcategoryList {...props} />);
      const { getByText, getByDisplayValue } = within(
        getByTestId('subcategory-item-Some bank account'),
      );

      const inputSubcategory = getByDisplayValue('Some bank account') as HTMLInputElement;
      const inputOpacity = getByDisplayValue('0.8') as HTMLInputElement;

      const buttonCreate = getByText('Create') as HTMLButtonElement;

      userEvent.clear(inputSubcategory);
      userEvent.type(inputSubcategory, 'Different bank account');

      fireEvent.change(inputOpacity, { target: { value: '0.75' } });

      userEvent.click(buttonCreate);

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith({
        categoryId: numericHash('my-category'),
        subcategory: 'Different bank account',
        hasCreditLimit: null,
        appreciationRate: null,
        isSAYE: null,
        opacity: 0.75,
      });
    });
  });
});
