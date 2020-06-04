/* eslint-disable max-len */
import { render, RenderResult, within, act, fireEvent } from '@testing-library/react';
import React from 'react';

import { NetWorthCategoryList, Props } from '.';
import { Subcategory } from '~client/types/net-worth';

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
        id: 'category-id-a',
        type: 'asset',
        category: 'Category A',
        color: '#ccfacc',
        isOption: false,
      },
      {
        id: 'category-id-b',
        type: 'liability',
        category: 'Category B',
        color: '#f1cccc',
        isOption: false,
      },
    ],
    subcategories: [
      {
        id: 'subcategory-id-a1',
        categoryId: 'category-id-a',
        subcategory: 'Subcategory A1',
        hasCreditLimit: null,
        opacity: 0.876,
      },
      {
        id: 'subcategory-id-b1',
        categoryId: 'category-id-b',
        subcategory: 'Subcategory B1',
        hasCreditLimit: true,
        opacity: 1,
      },
      {
        id: 'subcategory-id-b2',
        categoryId: 'category-id-b',
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
    categoryId         | category        | type           | color        | subcategories
    ${'category-id-a'} | ${'Category A'} | ${'asset'}     | ${'#ccfacc'} | ${props.subcategories.slice(0, 1)}
    ${'category-id-b'} | ${'Category B'} | ${'liability'} | ${'#f1cccc'} | ${props.subcategories.slice(1, 3)}
  `('editing category: $category', ({ categoryId, category, type, color, subcategories }) => {
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

        act(() => {
          fireEvent.change(input, { target: { value: newValue } });
        });
        act(() => {
          fireEvent.blur(input);
        });

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

            act(() => {
              fireEvent.click(button);
            });

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
        expect.assertions(3);
        const { button } = getDeleteButton();
        act(() => {
          fireEvent.click(button);
        });
        // TODO: refactor <CrudList /> so that onDelete is only called with the ID
        // (this will happen in feature/accessible-list)
        expect(onDeleteCategory).toHaveBeenCalledTimes(1);
        const args = onDeleteCategory.mock.calls[0];
        expect(args.length).toBeGreaterThan(0);
        expect(args[0]).toBe(categoryId);
      });
    });

    describe('subcategory list', () => {
      const getSubcategoryExpandButton = (): RenderResult & {
        form: HTMLElement;
        expandButton: HTMLButtonElement;
      } => {
        const { form, ...renderResult } = getForm();
        const { getByTestId } = within(form);
        const expandButton = getByTestId('handle') as HTMLButtonElement;

        return { ...renderResult, form, expandButton };
      };

      const getSubcategoryForm = (): RenderResult & {
        form: HTMLElement;
        subcategoryForm: HTMLElement;
      } => {
        const { form, expandButton, ...renderResult } = getSubcategoryExpandButton();
        const { getByTestId } = within(form);
        act(() => {
          fireEvent.click(expandButton);
        });
        const subcategoryForm = getByTestId('subcategory-form') as HTMLElement;
        return { form, subcategoryForm, ...renderResult };
      };

      it('should not be rendered initially', () => {
        expect.assertions(1);
        const { form } = getSubcategoryExpandButton();
        const { queryByTestId } = within(form);
        expect(queryByTestId('subcategory-form')).not.toBeInTheDocument();
      });

      it('should be rendered after clicking the handle', () => {
        expect.assertions(2);
        const { expandButton, form } = getSubcategoryExpandButton();
        const { queryByTestId } = within(form);
        act(() => {
          fireEvent.click(expandButton);
        });
        expect(queryByTestId('subcategory-form')).toBeInTheDocument();
        act(() => {
          fireEvent.click(expandButton);
        });
        expect(queryByTestId('subcategory-form')).not.toBeInTheDocument();
      });

      describe.each<[string, Subcategory]>(
        subcategories.map((subcategory: Subcategory) => [subcategory.id, subcategory]),
      )('for the subcategory with id %s', (_, subcategory) => {
        const getSubForm = (): HTMLElement => {
          const { subcategoryForm } = getSubcategoryForm();
          const { getByTestId } = within(subcategoryForm);
          return getByTestId(`subcategory-item-${subcategory.subcategory}`) as HTMLElement;
        };

        describe('name field', () => {
          const getField = (): { input: HTMLInputElement; updateButton: HTMLButtonElement } => {
            const subForm = getSubForm();
            const { getByDisplayValue, getByText } = within(subForm);
            const input = getByDisplayValue(subcategory.subcategory) as HTMLInputElement;
            const updateButton = getByText('Update') as HTMLButtonElement;
            return { input, updateButton };
          };

          it('should be rendered', () => {
            expect.assertions(1);
            const { input } = getField();
            expect(input).toBeInTheDocument();
          });

          it('should call onUpdateSubcategory when changed', () => {
            expect.assertions(3);
            const { input, updateButton } = getField();
            act(() => {
              fireEvent.change(input, { target: { value: 'Some new subcategory name' } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe('Some new subcategory name');
            expect(props.onUpdateSubcategory).not.toHaveBeenCalled();

            act(() => {
              fireEvent.click(updateButton);
            });

            expect(props.onUpdateSubcategory).toHaveBeenCalledWith(subcategory.id, {
              categoryId,
              subcategory: 'Some new subcategory name',
              opacity: subcategory.opacity,
              hasCreditLimit: subcategory.hasCreditLimit,
            });
          });
        });

        describe('opacity field', () => {
          const getField = (): { input: HTMLInputElement; updateButton: HTMLButtonElement } => {
            const subForm = getSubForm();
            const { getByDisplayValue, getByText } = within(subForm);
            const input = getByDisplayValue(String(subcategory.opacity)) as HTMLInputElement;
            const updateButton = getByText('Update') as HTMLButtonElement;
            return { input, updateButton };
          };

          it('should be rendered with the correct props', () => {
            expect.assertions(5);
            const { input } = getField();
            expect(input).toBeInTheDocument();
            expect(input.type).toBe('range');
            expect(input.min).toBe('0');
            expect(input.max).toBe('1');
            expect(input.step).toBe('0.1');
          });

          it('should call onUpdateSubcategory when changed', () => {
            expect.assertions(3);
            const { input, updateButton } = getField();
            act(() => {
              fireEvent.change(input, { target: { value: '0.267' } });
            });
            act(() => {
              fireEvent.blur(input);
            });

            expect(input.value).toBe('0.267');
            expect(props.onUpdateSubcategory).not.toHaveBeenCalled();

            act(() => {
              fireEvent.click(updateButton);
            });

            expect(props.onUpdateSubcategory).toHaveBeenCalledWith(subcategory.id, {
              categoryId,
              subcategory: subcategory.subcategory,
              opacity: 0.267,
              hasCreditLimit: subcategory.hasCreditLimit,
            });
          });
        });

        if (type === 'liability') {
          describe('(liability type) credit limit field', () => {
            const getField = (): { input: HTMLInputElement; updateButton: HTMLButtonElement } => {
              const subForm = getSubForm();
              const { getByText, getByRole } = within(subForm);
              const input = getByRole('checkbox') as HTMLInputElement;
              const updateButton = getByText('Update') as HTMLButtonElement;
              return { input, updateButton };
            };

            it('should be rendered', () => {
              expect.assertions(2);
              const { input } = getField();
              expect(input).toBeInTheDocument();
              expect(input.checked).toBe(!!subcategory.hasCreditLimit);
            });

            it('should call onUpdateSubcategory when changed', () => {
              expect.assertions(2);
              const { input, updateButton } = getField();
              act(() => {
                fireEvent.click(input);
              });

              expect(props.onUpdateSubcategory).not.toHaveBeenCalled();

              act(() => {
                fireEvent.click(updateButton);
              });

              expect(props.onUpdateSubcategory).toHaveBeenCalledWith(subcategory.id, {
                categoryId,
                subcategory: subcategory.subcategory,
                opacity: subcategory.opacity,
                hasCreditLimit: !subcategory.hasCreditLimit,
              });
            });
          });
        } else {
          describe('(non-liability-type) credit limit field', () => {
            it('should not be rendered', () => {
              expect.assertions(1);
              const { queryByRole } = within(getSubForm());
              expect(queryByRole('checkbox')).not.toBeInTheDocument();
            });
          });
        }
      });

      describe('subcategory create form', () => {
        const getSubCreateForm = (): HTMLElement => {
          const { subcategoryForm } = getSubcategoryForm();
          const { getByTestId } = within(subcategoryForm);
          return getByTestId('subcategory-item-Some bank account') as HTMLElement;
        };

        it('should be rendered', () => {
          expect.assertions(1);
          const createForm = getSubCreateForm();
          expect(createForm).toBeInTheDocument();
        });

        describe.each`
          subField         | subValue               | testSubValue             | testSubCreateValue
          ${'subcategory'} | ${'Some bank account'} | ${'My test subcategory'} | ${undefined}
          ${'opacity'}     | ${'0.8'}               | ${'0.112'}               | ${0.112}
        `(
          '$subField field',
          ({ subField, subValue, testSubValue, testSubCreateValue = testSubValue }) => {
            const getField = (): {
              input: HTMLInputElement;
              createButton: HTMLButtonElement;
            } => {
              const createForm = getSubCreateForm();
              const { getByDisplayValue, getByText } = within(createForm);
              const input = getByDisplayValue(subValue) as HTMLInputElement;
              const createButton = getByText('Create') as HTMLButtonElement;
              return { input, createButton };
            };

            it('should render an input', () => {
              expect.assertions(1);
              const { input } = getField();
              expect(input).toBeInTheDocument();
            });

            it('should call onCreateSubcategory on change', () => {
              expect.assertions(3);
              const { input, createButton } = getField();
              act(() => {
                fireEvent.change(input, { target: { value: testSubValue } });
              });
              act(() => {
                fireEvent.blur(input);
              });

              expect(input.value).toBe(testSubValue);
              expect(onCreateSubcategory).not.toHaveBeenCalled();

              act(() => {
                fireEvent.click(createButton);
              });

              expect(onCreateSubcategory).toHaveBeenCalledWith({
                categoryId,
                subcategory: 'Some bank account',
                opacity: 0.8,
                hasCreditLimit: type === 'asset' ? null : false,
                [subField]: testSubCreateValue,
              });
            });
          },
        );
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

            act(() => {
              fireEvent.click(button);
            });

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
