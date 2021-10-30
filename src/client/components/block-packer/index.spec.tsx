import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import * as stubs from './__tests__/stubs';
import { BlockPacker, Props } from '.';
import { blockPacker } from '~client/modules/block-packer';
import type { BlockItem, WithSubTree } from '~client/types';

describe('<BlockPacker />', () => {
  const getContainer = (customProps = {}): RenderResult =>
    render(<BlockPacker {...stubs.props} {...customProps} />);

  it('should render a status bar', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('status-bar')).toHaveTextContent('some-status bar');
  });

  describe.each`
    event             | handler
    ${'blurring'}     | ${fireEvent.blur}
    ${'mousing out'}  | ${fireEvent.mouseOut}
    ${'touching out'} | ${fireEvent.touchEnd}
  `('$event of the tree', ({ handler }) => {
    const setup = (): void => {
      const { getByTestId } = getContainer();
      act(() => {
        handler(getByTestId('block-tree'));
      });
    };

    it('should call onHover with null', () => {
      expect.assertions(2);
      setup();
      expect(stubs.props.onHover).toHaveBeenCalledTimes(1);
      expect(stubs.props.onHover).toHaveBeenCalledWith(null);
    });
  });

  const interact = (handler: (elem: HTMLElement) => void, id: string): void => {
    const { getByTestId } = getContainer();
    act(() => {
      handler(getByTestId(id));
    });
  };

  describe.each`
    event             | handler
    ${'focusing'}     | ${fireEvent.focus}
    ${'mousing over'} | ${fireEvent.mouseOver}
    ${'touching'}     | ${fireEvent.touchStart}
  `('$event a child', ({ handler }) => {
    it.each`
      id
      ${'parent block 1'}
      ${'parent block 2'}
    `('should call onHover with the name', ({ id }) => {
      expect.assertions(2);
      interact(handler, id);
      expect(stubs.props.onHover).toHaveBeenCalledTimes(1);
      expect(stubs.props.onHover).toHaveBeenCalledWith(id);
    });
  });

  describe.each`
    event             | handler
    ${'focusing'}     | ${fireEvent.focus}
    ${'mousing over'} | ${fireEvent.mouseOver}
    ${'touching'}     | ${fireEvent.touchStart}
  `('$event a sub-tree child', ({ handler }) => {
    it.each`
      parent              | id
      ${'parent block 1'} | ${'child block A'}
      ${'parent block 1'} | ${'child block B'}
      ${'parent block 1'} | ${'child block C'}
    `('should call onHover with the name and sub-name', ({ parent, id }) => {
      expect.assertions(2);
      interact(handler, id);
      expect(stubs.props.onHover).toHaveBeenCalledTimes(1);
      expect(stubs.props.onHover).toHaveBeenCalledWith(parent, id);
    });
  });

  describe('focusing an arbitrary-depth subtree child', () => {
    const propsArbitraryDepth: Props = {
      blocks: blockPacker<WithSubTree<BlockItem>>(10, 6, [
        {
          name: 'A1',
          total: 100,
          subTree: [
            {
              name: 'A2',
              total: 100,
              subTree: [
                {
                  name: 'A3',
                  total: 100,
                  subTree: [
                    {
                      name: 'A4',
                      total: 100,
                      subTree: [
                        {
                          name: 'A5',
                          total: 100,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]),
      activeBlocks: [],
      status: '',
      onHover: jest.fn(),
      onClick: jest.fn(),
    };

    it('should call onHover with the full list of names', () => {
      expect.assertions(2);
      const { getByTestId } = render(<BlockPacker {...propsArbitraryDepth} />);
      userEvent.hover(getByTestId('A5'));

      expect(propsArbitraryDepth.onHover).toHaveBeenCalledTimes(1);
      expect(propsArbitraryDepth.onHover).toHaveBeenCalledWith('A1', 'A2', 'A3', 'A4', 'A5');
    });
  });

  const fireActivateEvent = (element: HTMLElement): void => {
    userEvent.type(element, '{enter}');
  };

  describe.each`
    event           | handler
    ${'clicking'}   | ${userEvent.click}
    ${'activating'} | ${fireActivateEvent}
  `('when $event a level-0 block containing a breakdown', () => {
    // This requires a testing environment which actually renders the block
    it.todo('should expand the block to fill the view');
  });

  describe('when passing a custom child', () => {
    const setupWithCustomChild = (): RenderResult =>
      getContainer({
        blocks: blockPacker<BlockItem>(10, 6, [
          {
            name: 'some block',
            total: 24,
            text: <div style={{ color: 'red' }}>Some react child</div>,
          },
          {
            name: 'other block',
            total: 36,
          },
        ]),
      });

    it('should render the child', () => {
      expect.assertions(2);
      const { getByText } = setupWithCustomChild();
      const child = getByText('Some react child');
      expect(child).toBeInTheDocument();
      expect(child.style.color).toBe('red');
    });
  });
});
