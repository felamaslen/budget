import { render, fireEvent, RenderResult, act } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import { BlockPacker, Props } from '.';
import { blockPacker } from '~client/modules/block-packer';
import type { BlockItem, WithSubTree } from '~client/types';

describe('<BlockPacker />', () => {
  const blocks = blockPacker<BlockItem>(10, 6, [
    {
      name: 'parent block 1',
      total: 24,
      color: 'darkorange',
      subTree: [
        {
          name: 'child block A',
          total: 8,
        },
        {
          name: 'child block B',
          total: 14,
        },
        {
          name: 'child block C',
          total: 2,
        },
      ],
    },
    {
      name: 'parent block 2',
      total: 36,
      color: 'purple',
      hasBreakdown: true,
    },
  ]);

  const props: Props = {
    blocks,
    activeBlocks: ['not_foo', 'not_bar'],
    status: 'some-status bar',
    onClick: jest.fn(),
    onHover: jest.fn(),
  };

  const getContainer = (customProps = {}): RenderResult =>
    render(<BlockPacker {...props} {...customProps} />);

  it('should render a block tree', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('block-tree')).toMatchInlineSnapshot(`
      .emotion-0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      .emotion-2 {
        float: left;
        height: 100%;
        width: 100%;
      }

      .emotion-6 {
        background-image: linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(0,0,0,0.2));
        box-shadow: inset -1px -1px 13px rgba(0,0,0,0.4);
        cursor: default;
        float: left;
        height: 100%;
        outline: none;
        overflow: hidden;
        position: relative;
        width: 100%;
      }

      .emotion-6:hover::after,
      .emotion-6:focus::after {
        content: '';
        display: block;
        height: 100%;
        width: 100%;
        background-color: rgba(255,255,0,0.4);
      }

      .e1ubqewq7 .emotion-6 {
        background-image: none;
        box-shadow: 1px 1px 3px -1px inset rgba(0,0,0,0.8);
        overflow: hidden;
        padding-top: 1rem;
        box-shadow: 0 0 1px inset rgba(0,0,0,0.6);
      }

      .e1ubqewq7 .emotion-6::after {
        box-sizing: content-box;
        margin-top: -1rem;
        padding-bottom: 1rem;
      }

      .emotion-12 {
        background-image: none;
        box-shadow: inset -1px -1px 13px rgba(0,0,0,0.4);
        cursor: default;
        float: left;
        height: 100%;
        outline: none;
        overflow: hidden;
        position: relative;
        width: 100%;
      }

      .e1ubqewq7 .emotion-12 {
        background-image: none;
        box-shadow: 1px 1px 3px -1px inset rgba(0,0,0,0.8);
        overflow: hidden;
        padding-top: 1rem;
      }

      .e1ubqewq7 .emotion-12::after {
        box-sizing: content-box;
        margin-top: -1rem;
        padding-bottom: 1rem;
      }

      <div
        class="emotion-0 emotion-1"
        data-testid="block-tree"
      >
        <div
          class="emotion-2 emotion-3"
          style="height: 100%; width: 100%;"
        >
          <div
            class="emotion-2 emotion-3"
            style="height: 100%; width: 60%;"
          >
            <div
              class="emotion-6 emotion-7"
              data-testid="parent block 2"
              name="parent block 2"
              role="button"
              style="height: 100%; width: 100%; background-color: purple;"
              tabindex="0"
            />
          </div>
          <div
            class="emotion-2 emotion-3"
            style="height: 100%; width: 40%;"
          >
            <div
              class="emotion-2 emotion-3"
              style="height: 100%; width: 100%;"
            >
              <div
                class="emotion-12 emotion-7"
                data-testid="parent block 1"
                name="parent block 1"
                role="container"
                style="height: 100%; width: 100%; background-color: darkorange;"
                tabindex="0"
              >
                <div
                  class="emotion-2 emotion-3"
                  style="height: 100%; width: 100%;"
                >
                  <div
                    class="emotion-2 emotion-3"
                    style="height: 58.333333333333336%; width: 100%;"
                  >
                    <div
                      class="emotion-6 emotion-7"
                      data-testid="child block B"
                      name="child block B"
                      role="container"
                      style="height: 100%; width: 100%;"
                      tabindex="0"
                    />
                  </div>
                  <div
                    class="emotion-2 emotion-3"
                    style="height: 41.66666666666667%; width: 100%;"
                  >
                    <div
                      class="emotion-2 emotion-3"
                      style="height: 100%; width: 80%;"
                    >
                      <div
                        class="emotion-6 emotion-7"
                        data-testid="child block A"
                        name="child block A"
                        role="container"
                        style="height: 100%; width: 100%;"
                        tabindex="0"
                      />
                    </div>
                    <div
                      class="emotion-2 emotion-3"
                      style="height: 100%; width: 19.999999999999996%;"
                    >
                      <div
                        class="emotion-2 emotion-3"
                        style="height: 100.00000000000003%; width: 100%;"
                      >
                        <div
                          class="emotion-6 emotion-7"
                          data-testid="child block C"
                          name="child block C"
                          role="container"
                          style="height: 100%; width: 100%;"
                          tabindex="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it('should render a status bar', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer();
    expect(getByTestId('status-bar')).toHaveTextContent('some-status bar');
  });

  it('should not render blocks if they are null', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer({ blocks: null });
    expect(getByTestId('block-tree')).toMatchInlineSnapshot(`
      .emotion-0 {
        display: -webkit-box;
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex: 1;
        -ms-flex: 1;
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      <div
        class="emotion-0 emotion-1"
        data-testid="block-tree"
      />
    `);
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
      expect(props.onHover).toHaveBeenCalledTimes(1);
      expect(props.onHover).toHaveBeenCalledWith(null);
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
      expect(props.onHover).toHaveBeenCalledTimes(1);
      expect(props.onHover).toHaveBeenCalledWith(id);
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
      expect(props.onHover).toHaveBeenCalledTimes(1);
      expect(props.onHover).toHaveBeenCalledWith(parent, id);
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
      act(() => {
        fireEvent.mouseOver(getByTestId('A5'));
      });

      expect(propsArbitraryDepth.onHover).toHaveBeenCalledTimes(1);
      expect(propsArbitraryDepth.onHover).toHaveBeenCalledWith('A1', 'A2', 'A3', 'A4', 'A5');
    });
  });

  const fireActivateEvent = (element: HTMLElement): void => {
    fireEvent.keyDown(element, {
      key: 'Enter',
    });
  };

  describe.each`
    event           | handler
    ${'clicking'}   | ${fireEvent.click}
    ${'activating'} | ${fireActivateEvent}
  `('when $event a level-0 block containing a breakdown', ({ handler }) => {
    let clock: sinon.SinonFakeTimers;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      clock.restore();
    });

    it('should expand the block to fill the view', () => {
      expect.assertions(10);

      const { container, getByTestId } = getContainer();
      const parentBlock = getByTestId('parent block 2');
      act(() => {
        handler(parentBlock);
      });

      const preview = getByTestId('preview');
      expect(preview).toBeInTheDocument();
      expect(preview.style.left).toBe(`${parentBlock.offsetLeft}px`);
      expect(preview.style.top).toBe(`${parentBlock.offsetTop}px`);
      expect(preview.style.width).toBe(`${parentBlock.offsetWidth}px`);
      expect(preview.style.height).toBe(`${parentBlock.offsetHeight}px`);
      expect(preview.style.backgroundColor).toBe('rgba(128, 0, 128, 0)');

      act(() => {
        clock.next();
      });

      expect(preview.style.left).toBe('0px');
      expect(preview.style.top).toBe('0px');
      expect(preview.style.width).toBe(`${(container as HTMLDivElement).offsetWidth}px`);
      expect(preview.style.height).toBe(`${(container as HTMLDivElement).offsetHeight}px`);
    });
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
