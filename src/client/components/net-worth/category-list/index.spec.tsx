/* eslint-disable max-len */
import { render, RenderResult, within, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import numericHash from 'string-hash';

import { NetWorthCategoryList, Props } from '.';
import { NetWorthCategoryType } from '~client/types/enum';

describe('<NetWorthCategoryList />', () => {
  const onCreateCategory = jest.fn();
  const onUpdateCategory = jest.fn();
  const onDeleteCategory = jest.fn();

  const onCreateSubcategory = jest.fn();
  const onUpdateSubcategory = jest.fn();
  const onDeleteSubcategory = jest.fn();

  const props: Props = {
    categories: [
      {
        id: numericHash('category-id-a'),
        type: NetWorthCategoryType.Asset,
        category: 'Category A',
        color: '#ccfacc',
        isOption: false,
      },
      {
        id: numericHash('category-id-b'),
        type: NetWorthCategoryType.Liability,
        category: 'Category B',
        color: '#f1cccc',
        isOption: false,
      },
    ],
    subcategories: [
      {
        id: numericHash('subcategory-id-a1'),
        categoryId: numericHash('category-id-a'),
        subcategory: 'Subcategory A1',
        hasCreditLimit: null,
        opacity: 0.876,
      },
      {
        id: numericHash('subcategory-id-b1'),
        categoryId: numericHash('category-id-b'),
        subcategory: 'Subcategory B1',
        hasCreditLimit: true,
        opacity: 1,
      },
      {
        id: numericHash('subcategory-id-b2'),
        categoryId: numericHash('category-id-b'),
        subcategory: 'Subcategory B2',
        hasCreditLimit: false,
        opacity: 0.659,
      },
    ],
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
  };

  const setup = (): RenderResult => render(<NetWorthCategoryList {...props} />);

  const switchToOption = { isOption: true, type: 'asset' };

  describe.each`
    categoryId                      | category        | type           | color        | subcategories
    ${numericHash('category-id-a')} | ${'Category A'} | ${'asset'}     | ${'#ccfacc'} | ${props.subcategories.slice(0, 1)}
    ${numericHash('category-id-b')} | ${'Category B'} | ${'liability'} | ${'#f1cccc'} | ${props.subcategories.slice(1, 3)}
  `('editing category: $category', ({ categoryId, category, type, color }) => {
    const typeDisplayValue = type === 'asset' ? 'Asset' : 'Liability';

    const newTypeValue = type === 'asset' ? 'liability' : 'asset';
    const newTypeInputValue = type === 'asset' ? 'Liability' : 'Asset';

    const getForm = (): RenderResult & { form: HTMLElement } => {
      const renderResult = setup();
      const form = renderResult.getByTestId(`category-item-${categoryId}`);

      return { ...renderResult, form };
    };

    describe('form', () => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { form } = getForm();
        expect(form).toBeInTheDocument();
      });
    });

    describe.each`
      field              | value               | newValue
      ${'category name'} | ${category}         | ${'My new category'}
      ${'type'}          | ${typeDisplayValue} | ${newTypeInputValue}
      ${'isOption'}      | ${typeDisplayValue} | ${'Option'}
      ${'Color'}         | ${color}            | ${'#ff0a8b'}
    `('$field field', ({ value, newValue }) => {
      const getInput = (): RenderResult & { input: HTMLInputElement } => {
        const renderResult = getForm();
        const { getByDisplayValue } = within(renderResult.form);
        const input = getByDisplayValue(value) as HTMLInputElement;
        return { ...renderResult, input };
      };

      it('should be rendered', () => {
        expect.assertions(1);
        const { input } = getInput();
        expect(input).toBeInTheDocument();
      });

      it('should not call onUpdateCategory when changed', () => {
        expect.assertions(2);
        const { input } = getInput();

        fireEvent.change(input, { target: { value: newValue } });
        userEvent.tab();

        expect(input.value).toBe(newValue);
        expect(props.onUpdateCategory).not.toHaveBeenCalled();
      });
    });

    describe('update button', () => {
      const getUpdateButton = (): RenderResult & {
        form: HTMLElement;
        button: HTMLButtonElement;
      } => {
        const renderResult = getForm();
        const { getByText } = within(renderResult.form);
        const button = getByText('Update') as HTMLButtonElement;
        return { ...renderResult, button };
      };

      it('should be rendered', () => {
        expect.assertions(1);
        const { button } = getUpdateButton();
        expect(button).toBeInTheDocument();
      });

      describe.each`
        field         | value       | displayValue        | testValue            | testInputValue       | updateValue
        ${'category'} | ${category} | ${undefined}        | ${'My new category'} | ${undefined}         | ${undefined}
        ${'color'}    | ${color}    | ${undefined}        | ${'#ff0a8b'}         | ${undefined}         | ${undefined}
        ${'type'}     | ${type}     | ${typeDisplayValue} | ${newTypeValue}      | ${newTypeInputValue} | ${undefined}
        ${'isOption'} | ${type}     | ${typeDisplayValue} | ${'Option'}          | ${undefined}         | ${switchToOption}
      `(
        'when changing the $field field',
        ({
          field,
          value,
          displayValue = value,
          testValue,
          testInputValue = testValue,
          updateValue,
        }) => {
          it('should call onUpdateCategory on click', () => {
            expect.assertions(3);
            const { button, form } = getUpdateButton();
            const { getByDisplayValue } = within(form);
            const input = getByDisplayValue(displayValue) as HTMLInputElement;

            act(() => {
              fireEvent.change(input, { target: { value: testInputValue } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe(testInputValue);
            expect(props.onUpdateCategory).not.toHaveBeenCalled();

            userEvent.click(button);

            expect(props.onUpdateCategory).toHaveBeenCalledWith(categoryId, {
              category,
              color,
              type,
              isOption: false,
              ...(updateValue ?? { [field]: testValue }),
            });
          });

          it("should be disabled if the value wasn't changed", () => {
            expect.assertions(5);

            const { button, form } = getUpdateButton();
            const { getByDisplayValue } = within(form);
            const input = getByDisplayValue(displayValue) as HTMLInputElement;

            expect(button.disabled).toBe(true);
            const previousValue = input.value;

            act(() => {
              fireEvent.change(input, { target: { value: testInputValue } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe(testInputValue);
            expect(button.disabled).toBe(false);

            act(() => {
              fireEvent.change(input, { target: { value: previousValue } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe(previousValue);
            expect(button.disabled).toBe(true);
          });
        },
      );
    });

    describe('delete button', () => {
      const getDeleteButton = (): RenderResult & {
        form: HTMLElement;
        button: HTMLButtonElement;
      } => {
        const renderResult = getForm();
        const { getByText } = within(renderResult.form);
        const button = getByText('−') as HTMLButtonElement;
        return { ...renderResult, button };
      };

      it('should be rendered', () => {
        expect.assertions(1);
        const { button } = getDeleteButton();
        expect(button).toBeInTheDocument();
      });

      it('should call onDeleteCategory on click', () => {
        expect.assertions(2);
        const { button } = getDeleteButton();
        userEvent.click(button);
        expect(onDeleteCategory).toHaveBeenCalledTimes(1);
        expect(onDeleteCategory).toHaveBeenCalledWith(categoryId);
      });
    });
  });

  describe('creating a category', () => {
    const getForm = (): RenderResult & { form: HTMLElement } => {
      const renderResult = setup();
      const form = renderResult.getByTestId(`category-item-create`);

      return { ...renderResult, form };
    };

    describe('form', () => {
      it('should be rendered', () => {
        expect.assertions(1);
        const { form } = getForm();
        expect(form).toBeInTheDocument();
      });
    });

    describe.each`
      field              | value        | displayValue | newValue
      ${'category name'} | ${'Cash'}    | ${undefined} | ${'My new category'}
      ${'type'}          | ${'asset'}   | ${'Asset'}   | ${'Liability'}
      ${'isOption'}      | ${'asset'}   | ${'Asset'}   | ${'Option'}
      ${'color'}         | ${'#ccffcc'} | ${undefined} | ${'#ff0a8b'}
    `('$field field', ({ value, newValue, displayValue = value, newInputValue = newValue }) => {
      const getInput = (): RenderResult & { input: HTMLInputElement } => {
        const renderResult = getForm();
        const { getByDisplayValue } = within(renderResult.form);
        const input = getByDisplayValue(displayValue) as HTMLInputElement;
        return { ...renderResult, input };
      };

      it('should be rendered', () => {
        expect.assertions(1);
        const { input } = getInput();
        expect(input).toBeInTheDocument();
      });

      it('should not call onUpdateCategory when changed', () => {
        expect.assertions(2);
        const { input } = getInput();

        act(() => {
          fireEvent.change(input, { target: { value: newInputValue } });
        });
        act(() => {
          fireEvent.blur(input);
        });

        expect(input.value).toBe(newInputValue);
        expect(props.onCreateCategory).not.toHaveBeenCalled();
      });
    });

    describe('create button', () => {
      const getCreateButton = (): RenderResult & {
        form: HTMLElement;
        button: HTMLButtonElement;
      } => {
        const renderResult = getForm();
        const { getByText } = within(renderResult.form);
        const button = getByText('Create') as HTMLButtonElement;
        return { ...renderResult, button };
      };

      it('should be rendered', () => {
        expect.assertions(1);
        const { button } = getCreateButton();
        expect(button).toBeInTheDocument();
      });

      describe.each`
        field         | value        | displayValue | testValue            | testInputValue | testCreateValue
        ${'category'} | ${'Cash'}    | ${undefined} | ${'My new category'} | ${undefined}   | ${undefined}
        ${'color'}    | ${'#ccffcc'} | ${undefined} | ${'#ff0a8b'}         | ${undefined}   | ${undefined}
        ${'type'}     | ${'Asset'}   | ${'Asset'}   | ${'liability'}       | ${'Liability'} | ${undefined}
        ${'isOption'} | ${'Asset'}   | ${'Asset'}   | ${'Option'}          | ${undefined}   | ${switchToOption}
      `(
        'when changing the $field field',
        ({
          field,
          value,
          displayValue = value,
          testValue,
          testInputValue = testValue,
          testCreateValue,
        }) => {
          it('should call onCreateCategory on click', () => {
            expect.assertions(3);
            const { button, form } = getCreateButton();
            const { getByDisplayValue } = within(form);
            const input = getByDisplayValue(displayValue) as HTMLInputElement;

            act(() => {
              fireEvent.change(input, { target: { value: testInputValue } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe(testInputValue);
            expect(props.onCreateCategory).not.toHaveBeenCalled();

            userEvent.click(button);

            expect(props.onCreateCategory).toHaveBeenCalledWith({
              category: 'Cash',
              color: '#ccffcc',
              type: 'asset',
              isOption: false,
              ...(testCreateValue ?? { [field]: testValue }),
            });
          });
        },
      );
    });
  });
});
