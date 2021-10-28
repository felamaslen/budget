import { act, renderHook } from '@testing-library/react-hooks';

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
      type: 'add',
      onCancel: jest.fn(),
      onSubmit: jest.fn(),
    } as Props<ListItemInput>;

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
});
