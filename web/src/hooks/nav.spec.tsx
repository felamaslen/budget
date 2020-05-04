import sinon from 'sinon';
import React from 'react';
import { render, fireEvent, act, RenderResult } from '@testing-library/react';

import { Button, ActionType, useNav, NULL_COMMAND } from './nav';
import { CREATE_ID } from '~client/constants/data';
import { Page, PageList } from '~client/types/app';
import { Bill } from '~client/types/list';

describe('Navigation hook', () => {
  type TestProps = {
    nav?: boolean;
    items?: Bill[];
    page?: PageList;
  };

  const bills: Bill[] = [
    { id: 'id1', date: new Date('2020-04-20'), item: 'Water', cost: 3654 },
    { id: 'id2', date: new Date('2020-04-21'), item: 'Rent', cost: 176900 },
    { id: 'id3', date: new Date('2020-04-22'), item: 'Phone', cost: 1096 },
  ];

  const TestComponent: React.FC<TestProps> = ({
    nav = true,
    items = bills,
    page = Page.bills as PageList,
  }) => {
    const [state, setActive, setCommand, onNext, onPrev] = useNav<Bill>(nav, items, page);

    return (
      <div>
        <div data-testid="state">{JSON.stringify(state)}</div>
        <input
          data-testid="set-active"
          onChange={({ target: { value } }): void => {
            const [id, column] = JSON.parse(value) as [string, string];
            setActive(id, column);
          }}
        />
        <input
          data-testid="set-command"
          onChange={({ target: { value } }): void => setCommand(JSON.parse(value))}
        />
        <button data-testid="next" onClick={onNext} />
        <button data-testid="prev" onClick={onPrev} />
      </div>
    );
  };

  it('should return the state', () => {
    expect.assertions(1);

    const { getByTestId } = render(<TestComponent />);
    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual({
      nav: true,
      command: NULL_COMMAND,
      items: bills.map(({ date, ...rest }) => ({ date: date.toISOString(), ...rest })),
      columns: ['date', 'item', 'cost'],
      activeId: null,
      activeItem: null,
      activeColumn: null,
    });
  });

  it('should update the items in state when they change externally', () => {
    expect.assertions(1);

    const { getByTestId, container } = render(<TestComponent />);

    const newItems = [
      ...bills,
      { id: 'id4', date: new Date('2020-04-23'), item: 'Mortgage', cost: 79565 },
    ];

    act(() => {
      render(<TestComponent items={newItems} />, { container });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        items: newItems.map(({ date, ...rest }) => ({ date: date.toISOString(), ...rest })),
      }),
    );
  });

  it('should change the columns if the page changes', () => {
    expect.assertions(1);

    const { getByTestId, container } = render(<TestComponent />);

    act(() => {
      render(<TestComponent page={Page.food} />, { container });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        columns: ['date', 'item', 'category', 'cost', 'shop'],
      }),
    );
  });

  it('should toggle the navigation state when the external prop changes', () => {
    expect.assertions(1);

    const { getByTestId, container } = render(<TestComponent />);

    act(() => {
      render(<TestComponent nav={false} />, { container });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        nav: false,
      }),
    );
  });

  it.each([
    [
      {
        command: ActionType.ColumnsSet,
        payload: {
          columns: [],
        },
      },
      {
        payload: { columns: [] },
      },
    ],
    [ActionType.ColumnsSet, {}],
  ])('should set a command via a trigger', (action, result) => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    act(() => {
      fireEvent.change(getByTestId('set-command'), {
        target: {
          value: JSON.stringify(action),
        },
      });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        command: expect.objectContaining({
          type: ActionType.ColumnsSet,
          ...result,
        }),
      }),
    );
  });

  it('should navigate away (in the next event loop) on <escape>', () => {
    expect.assertions(2);

    const clock = sinon.useFakeTimers();
    const { getByTestId } = render(<TestComponent />);

    act(() => {
      fireEvent.keyDown(window, { key: 'Tab' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        command: expect.objectContaining({
          type: ActionType.Cancelled,
        }),
        activeId: CREATE_ID,
        activeColumn: 'date',
      }),
    );

    act(() => {
      clock.tick(1);
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        activeId: null,
        activeColumn: null,
      }),
    );

    clock.restore();
  });

  it('should navigate away (immediately) on <ctrl+enter>', () => {
    expect.assertions(1);

    const { getByTestId } = render(<TestComponent />);

    act(() => {
      fireEvent.keyDown(window, { key: 'Tab' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        command: NULL_COMMAND,
        activeId: null,
        activeColumn: null,
      }),
    );
  });

  it('should not do anything if the arrow keys are pressed without modifiers', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);

    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        command: NULL_COMMAND,
        activeId: null,
        activeColumn: null,
      }),
    );
  });

  describe('when nothing is active', () => {
    it.each([
      ['arrow', { key: 'ArrowRight', ctrlKey: true }],
      ['tab', { key: 'Tab' }],
    ])('should navigate rightwards, to the create item (using <%s>)', (_, event) => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to the last item (using <%s>)', (_, event) => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id3',
          activeColumn: 'cost',
        }),
      );
    });

    it('should navigate upwards, to the last item', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id3',
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate downwards, to the create item', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent />);

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });
  });

  describe('when the create item is active', () => {
    const toCreateItem = (): RenderResult => {
      const utils = render(<TestComponent />);
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
      });
      expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );

      return utils;
    };

    it.each([
      ['arrow', { key: 'ArrowRight', ctrlKey: true }],
      ['tab', { key: 'Tab' }],
    ])('should navigate rightwards, to the next column (using <%s>)', (_, event) => {
      expect.assertions(2);
      const { getByTestId } = toCreateItem();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'item',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to the last item (using <%s>)', (_, event) => {
      expect.assertions(2);
      const { getByTestId } = toCreateItem();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id3',
          activeColumn: 'cost',
        }),
      );
    });

    it('should navigate upwards, to the last item', () => {
      expect.assertions(2);
      const { getByTestId } = toCreateItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id3',
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate downwards, to the first existing item', () => {
      expect.assertions(2);
      const { getByTestId } = toCreateItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'date',
        }),
      );
    });

    describe('when on the last column', () => {
      const toLastColumn = (): RenderResult => {
        const utils = toCreateItem();
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to item
        });
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to cost
        });

        expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: CREATE_ID,
            activeColumn: 'cost',
          }),
        );

        return utils;
      };

      it.each([
        ['arrow', { key: 'ArrowRight', ctrlKey: true }],
        ['tab', { key: 'Tab' }],
      ])('should navigate rightwards, to the add button (using <%s>)', (_, event) => {
        expect.assertions(3);
        const { getByTestId } = toLastColumn();

        act(() => {
          fireEvent.keyDown(window, event);
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: CREATE_ID,
            activeColumn: Button.Add,
          }),
        );
      });

      it.each([
        ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
        ['tab', { key: 'Tab', shiftKey: true }],
      ])('should navigate leftwards, to the previous column (using <%s>)', (_, event) => {
        expect.assertions(3);
        const { getByTestId } = toLastColumn();

        act(() => {
          fireEvent.keyDown(window, event);
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: CREATE_ID,
            activeColumn: 'item',
          }),
        );
      });
    });

    describe('when the add button is focused', () => {
      const toAddButton = (): RenderResult => {
        const utils = render(<TestComponent />);
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to date
        });
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to item
        });
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to cost
        });
        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // to add button
        });
        expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: CREATE_ID,
            activeColumn: Button.Add,
          }),
        );

        return utils;
      };

      it.each([
        ['arrow', { key: 'ArrowRight', ctrlKey: true }],
        ['tab', { key: 'Tab' }],
      ])('should navigate rightwards, to the next row (using <%s>)', (_, event) => {
        expect.assertions(2);
        const { getByTestId } = toAddButton();

        act(() => {
          fireEvent.keyDown(window, event);
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: 'id1',
            activeColumn: 'date',
          }),
        );
      });

      it.each([
        ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
        ['tab', { key: 'Tab', shiftKey: true }],
      ])('should navigate leftwards, to the last column (using <%s>)', (_, event) => {
        expect.assertions(2);
        const { getByTestId } = toAddButton();

        act(() => {
          fireEvent.keyDown(window, event);
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: CREATE_ID,
            activeColumn: 'cost',
          }),
        );
      });

      it('should navigate upwards, to the last item', () => {
        expect.assertions(2);
        const { getByTestId } = toAddButton();

        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: 'id3',
            activeColumn: 'cost',
          }),
        );
      });

      it('should navigate downwards, to the first existing item', () => {
        expect.assertions(2);
        const { getByTestId } = toAddButton();

        act(() => {
          fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
        });

        expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
          expect.objectContaining({
            activeId: 'id1',
            activeColumn: 'cost',
          }),
        );
      });
    });
  });

  describe('when an existing item is active', () => {
    const toFirstItem = (): RenderResult => {
      const utils = render(<TestComponent />);
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
      });
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'date',
        }),
      );

      return utils;
    };
    const toMiddleItem = (): RenderResult => {
      const utils = render(<TestComponent />);
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id2',
          activeColumn: 'date',
        }),
      );

      return utils;
    };
    const toLastItem = (): RenderResult => {
      const utils = render(<TestComponent />);
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(utils.getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id3',
          activeColumn: 'date',
        }),
      );

      return utils;
    };

    it.each([
      ['arrow', { key: 'ArrowRight', ctrlKey: true }],
      ['tab', { key: 'Tab' }],
    ])('should navigate rightwards, to the next column (using <%s>)', (_, event) => {
      expect.assertions(2);
      const { getByTestId } = toFirstItem();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'item',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowRight', ctrlKey: true }],
      ['tab', { key: 'Tab' }],
    ])('should navigate rightwards, to the next item (using <%s>)', (_, event) => {
      expect.assertions(3);
      const { getByTestId } = toFirstItem();
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // item
      });
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true }); // cost
      });
      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'cost',
        }),
      );

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id2',
          activeColumn: 'date',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to another existing item (using <%s>)', (_, event) => {
      expect.assertions(3);
      const { getByTestId } = toFirstItem();
      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
      });
      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'item',
        }),
      );

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'date',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to the previous item (using <%s>)', (_, event) => {
      expect.assertions(2);
      const { getByTestId } = toMiddleItem();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'cost',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to the add button (using <%s>)', (_, event) => {
      expect.assertions(2);
      const { getByTestId } = toFirstItem();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: Button.Add,
        }),
      );
    });

    it('should navigate downwards, to another existing item', () => {
      expect.assertions(2);
      const { getByTestId } = toFirstItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id2',
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate downwards, to the create item', () => {
      expect.assertions(2);
      const { getByTestId } = toLastItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate upwards, to another existing item', () => {
      expect.assertions(2);
      const { getByTestId } = toMiddleItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: 'id1',
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate upwards, to the create item', () => {
      expect.assertions(2);
      const { getByTestId } = toFirstItem();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });
  });

  describe('when there are zero items', () => {
    const withZeroItems = (): RenderResult => render(<TestComponent items={[]} />);

    it.each([
      ['arrow', { key: 'ArrowRight', ctrlKey: true }],
      ['tab', { key: 'Tab' }],
    ])('should navigate rightwards, to the create item (using <%s>)', (_, event) => {
      expect.assertions(1);

      const { getByTestId } = withZeroItems();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });

    it.each([
      ['arrow', { key: 'ArrowLeft', ctrlKey: true }],
      ['tab', { key: 'Tab', shiftKey: true }],
    ])('should navigate leftwards, to the create item (using <%s>)', (_, event) => {
      expect.assertions(1);

      const { getByTestId } = withZeroItems();

      act(() => {
        fireEvent.keyDown(window, event);
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'cost',
        }),
      );
    });

    it('should navigate upwards, to the create item', () => {
      expect.assertions(1);
      const { getByTestId } = withZeroItems();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowUp', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });

    it('should navigate downwards, to the create item', () => {
      expect.assertions(1);
      const { getByTestId } = withZeroItems();

      act(() => {
        fireEvent.keyDown(window, { key: 'ArrowDown', ctrlKey: true });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: CREATE_ID,
          activeColumn: 'date',
        }),
      );
    });
  });

  describe('when navigation is off', () => {
    it('should not listen to navigation keys', () => {
      expect.assertions(1);
      const { getByTestId } = render(<TestComponent nav={false} />);

      act(() => {
        fireEvent.keyDown(window, { key: 'Tab' });
      });

      expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
        expect.objectContaining({
          activeId: null,
          activeColumn: null,
        }),
      );
    });
  });

  it('should listen to onNext', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    act(() => {
      fireEvent.click(getByTestId('next'));
    });
    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        activeId: CREATE_ID,
        activeColumn: null,
      }),
    );
  });

  it('should listen to onPrev', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    act(() => {
      fireEvent.click(getByTestId('prev'));
    });
    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        activeId: 'id3',
        activeColumn: null,
      }),
    );
  });

  it('should listen to setActive', () => {
    expect.assertions(1);
    const { getByTestId } = render(<TestComponent />);
    act(() => {
      fireEvent.change(getByTestId('set-active'), {
        target: { value: JSON.stringify(['id2', 'item']) },
      });
    });

    expect(JSON.parse(getByTestId('state').innerHTML)).toStrictEqual(
      expect.objectContaining({
        activeId: 'id2',
        activeColumn: 'item',
      }),
    );
  });
});
