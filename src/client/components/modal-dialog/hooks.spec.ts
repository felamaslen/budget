import { act, renderHook } from '@testing-library/react';

import { useModalSubmit } from './hooks';
import type { Props } from './types';

import {
  FormFieldIncomeDeductions,
  FormFieldStockSplits,
  FormFieldText,
  FormFieldTransactions,
} from '~client/components/form-field';
import { CREATE_ID } from '~client/constants/data';
import { ListItemInput } from '~client/types/gql';

describe(useModalSubmit.name, () => {
  describe.each`
    example                | field             | FieldComponent
    ${'income deductions'} | ${'deductions'}   | ${FormFieldIncomeDeductions}
    ${'fund transactions'} | ${'transactions'} | ${FormFieldTransactions}
    ${'fund stock splits'} | ${'stockSplits'}  | ${FormFieldStockSplits}
  `('when rendering a form with $example', ({ field, FieldComponent }) => {
    const props = {
      fields: {
        item: FormFieldText,
        [field]: FieldComponent,
      },
      active: true,
      onSubmit: jest.fn(),
    } as Pick<Props<ListItemInput>, 'active' | 'fields' | 'id' | 'item' | 'onSubmit'>;

    it('should initialise the array-type field with an empty array', () => {
      expect.assertions(2);

      const { result } = renderHook(() => useModalSubmit(props));
      act(() => {
        result.current.onChangeField('item', 'My item');
      });
      act(() => {
        result.current.onSubmitCallback();
      });

      expect(props.onSubmit).toHaveBeenCalledTimes(1);
      expect(props.onSubmit).toHaveBeenCalledWith(CREATE_ID, {
        item: 'My item',
        [field]: [],
      });
    });
  });

  describe('when submitting', () => {
    it('should clear the field values', () => {
      expect.assertions(2);

      const fields = {
        item: FormFieldText,
      };

      const { result } = renderHook(() =>
        useModalSubmit({
          fields,
          active: true,
          onSubmit: jest.fn(),
        }),
      );

      act(() => {
        result.current.onChangeField('item', 'My item');
      });

      expect(result.current.tempFields).toStrictEqual({
        item: 'My item',
      });

      act(() => {
        result.current.onSubmitCallback();
      });

      expect(result.current.tempFields).toStrictEqual({
        item: '',
      });
    });
  });
});
