import React from 'react';
import { render, fireEvent, RenderResult, act } from '@testing-library/react';

import BlockPacker, { Props } from '.';
import { Page } from '~client/types/app';

describe('<BlockPacker />', () => {
  const props: Props = {
    blocks: [
      {
        width: 10.4,
        height: 11.5,
        bits: [
          {
            name: Page.food,
            value: 5.1,
            color: 'black',
            width: 8,
            height: 9.3,
            blocks: [
              {
                width: 4.9,
                height: 9.21,
                bits: [
                  {
                    name: 'foo1',
                    value: 3,
                    color: 'teal',
                    width: 3,
                    height: 3.1,
                  },
                ],
              },
            ],
          },
          {
            name: Page.general,
            value: 5.2,
            width: 3,
            height: 3.1,
            color: 'red',
            blocks: [
              {
                width: 3,
                height: 3.1,
                bits: [
                  {
                    name: 'bar1',
                    value: 4,
                    color: 'teal',
                    width: 3,
                    height: 3.1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    activeMain: 'not_foo',
    activeSub: 'not_bar',
    deepBlock: Page.food,
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
      <div
        class="sc-gzVnrw gNROtb"
        data-testid="block-tree"
      >
        <div
          class="sc-htoDjs gGwFxh"
        >
          <div
            class="sc-bdVaJa sc-bwzfXH iEDPNl"
            height="11.5"
            style="width: 10.4px; height: 11.5px;"
            width="10.4"
          >
            <div
              class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
              height="9.3"
              name="food"
              style="background-color: rgb(67, 160, 71); width: 8px; height: 9.3px;"
              width="8"
            >
              <div
                class="sc-bdVaJa sc-bwzfXH iEDPNl"
                height="9.21"
                style="width: 4.9px; height: 9.21px;"
                width="4.9"
              >
                <div
                  class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                  height="3.1"
                  style="width: 3px; height: 3.1px;"
                  width="3"
                />
              </div>
            </div>
            <div
              class="sc-bdVaJa sc-htpNat sc-bxivhb Wlpig"
              height="3.1"
              name="general"
              style="background-color: rgb(1, 87, 155); width: 3px; height: 3.1px;"
              width="3"
            >
              <div
                class="sc-bdVaJa sc-bwzfXH iEDPNl"
                height="3.1"
                style="width: 3px; height: 3.1px;"
                width="3"
              >
                <div
                  class="sc-bdVaJa sc-htpNat sc-EHOje hshgXl"
                  height="3.1"
                  style="width: 3px; height: 3.1px;"
                  width="3"
                />
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

  it('should call onHover with null when mousing out of the tree', () => {
    expect.assertions(2);
    const { getByTestId } = getContainer();
    act(() => {
      fireEvent.mouseOut(getByTestId('block-tree'));
    });
    expect(props.onHover).toHaveBeenCalledTimes(1);
    expect(props.onHover).toHaveBeenCalledWith(null);
  });

  it('should not render blocks if they are null', () => {
    expect.assertions(1);
    const { getByTestId } = getContainer({ blocks: null });
    expect(getByTestId('block-tree')).toMatchInlineSnapshot(`
      <div
        class="sc-gzVnrw gNROtb"
        data-testid="block-tree"
      />
    `);
  });
});
